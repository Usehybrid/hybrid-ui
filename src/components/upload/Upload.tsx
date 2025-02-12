import * as React from 'react'
import classes from './styles.module.css'
import clsx from 'clsx'
import {formatBytes, getFileTypeIcon, renderFileTypes} from './helper'
import {SVG} from '../svg'
import close from '../assets/close.svg'
import fileUpload from '../assets/file-upload.svg'
import deleteOutline from '../assets/delete-bin.svg'
import {pluralize} from '../../utils'
import {DOCS_TYPE} from '../../types'
export type UploadFileType = {
  id?: string
  ext: string
  type: string
  url: string
  metaData?: {
    fileName: string
    key: string
  }
  key: string
  fileName: string
  isUploaded: boolean
  size: string
  setIntervalFunction?: any
}

export enum UPLOAD_ALIGN_BTN_CONTENT {
  LEFT = 'flex-start',
  CENTER = 'center',
  RIGHT = 'flex-end',
}
interface UploadProps {
  type: DOCS_TYPE
  disabled?: boolean
  getUploadDoc: (arg: any) => void
  setIsUploading?: (arg: any) => void
  customComponent?: React.ReactNode
  fileUploadLimit?: number
  isMultiple?: boolean
  singleFileClassName?: string
  fileContainerClassName?: string
  uploadFileLimit?: number //its in MB
  uploadBtnClassName?: string
  alignContent?: UPLOAD_ALIGN_BTN_CONTENT
  showUploadIcon?: boolean
  additionalNode?: React.ReactElement
  addDocumentText?: string
  customUrl?: string
  beforeUploadHandler?: () => void
  inventoryId?: string | null
  softwareId?: string | null
  preLoadedFiles?: Array<UploadFileType>
  showFileList?: boolean
  acceptedFileTypes?: string
  extraSubtitleText?: string
  error?: string | null
  addDocumentSubtitle?: string
  handleImageUpload: (
    images: any[],
    type: DOCS_TYPE,
    key?: string,
    value?: string,
    customUrl?: string,
    inventoryId?: string | null,
    softwareId?: string | null,
  ) => Promise<{uploadedFiles: UploadFileType[]; isUploaded: boolean}>
  variant?: string
}

interface progressBarType {
  name: string
  progress: number
}

export function Upload({
  getUploadDoc,
  setIsUploading,
  customComponent,
  fileUploadLimit = 10,
  type,
  isMultiple = true,
  uploadFileLimit = 5,
  singleFileClassName,
  fileContainerClassName,
  uploadBtnClassName,
  alignContent,
  showUploadIcon = true,
  additionalNode,
  disabled = false,
  addDocumentText = 'Upload file',
  customUrl,
  beforeUploadHandler,
  extraSubtitleText,
  inventoryId = undefined,
  softwareId,
  preLoadedFiles = [],
  showFileList = true,
  acceptedFileTypes = 'image/png, image/jpeg, image/jpeg, image/webp, application/pdf, .doc, .docx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
  error,
  addDocumentSubtitle,
  handleImageUpload,
}: // variant = 'normal',
UploadProps) {
  const [cancelledKey, setCancelledKey] = React.useState<string[]>([])
  const [files, setFiles] = React.useState<UploadFileType[] | []>([])
  const [callUpload, setCallUpload] = React.useState(false)
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadFileType[] | []>([])
  const [fileUploadProgress, setFileUploadProgress] = React.useState<progressBarType[]>([])
  const [fileUploadLimitError, setFileUploadLimitError] = React.useState<string | null>(null)
  const [uploadLimitError, setUploadLimitError] = React.useState('')
  const [isFileUploadComplete, setIsFileUploadComplete] = React.useState(false)
  const fileInputRef = React.useRef<any>()
  const isInputDisabled =
    (fileUploadLimit &&
      files.filter(file => !cancelledKey.includes(file.key))?.length >= fileUploadLimit) ||
    disabled
      ? true
      : false

  React.useEffect(() => {
    console.log(uploadLimitError)

    const timer = setTimeout(() => {
      if (!!uploadLimitError.length) {
        setUploadLimitError('')
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [uploadLimitError])

  React.useEffect(() => {
    if (preLoadedFiles.length > 0) {
      const newFiles = preLoadedFiles.map(file => ({...file, isUploaded: true}))
      setFiles(newFiles)
      setUploadedFiles(newFiles)
    }
  }, [preLoadedFiles])

  async function handleFileChange(e: any) {
    const uploadedFiles = e.target.files
    setFileUploadLimitError(null)
    setUploadLimitError('')
    let allFiles: any = []
    if (
      fileUploadLimit &&
      uploadedFiles.length + files.filter(file => !cancelledKey.includes(file.key))?.length >
        fileUploadLimit
    ) {
      setFileUploadLimitError(
        `You are only allowed to upload ${fileUploadLimit} ${pluralize(
          fileUploadLimit,
          'file',
          'files',
        )}`,
      )
      return
    }
    let flag = false
    for (let key in uploadedFiles) {
      if (
        typeof uploadedFiles[key] === 'object' &&
        (uploadFileLimit || 5) >= Number((uploadedFiles[key]?.size / (1024 * 1024)).toFixed(2))
      ) {
        allFiles.push({
          type: uploadedFiles[key].type,
          url: URL.createObjectURL(uploadedFiles[key]),
          fileName: uploadedFiles[key]?.name,
          isUploaded: false,
          size: formatBytes(uploadedFiles[key]?.size),
        })
      }
      if (
        uploadedFiles[key]?.size &&
        (uploadFileLimit || 5) < Number((uploadedFiles[key]?.size / (1024 * 1024)).toFixed(2))
      ) {
        flag = true
      }
    }

    allFiles = allFiles.map((file: UploadFileType) => {
      const key = (Math.random() + 1).toString(36).substring(7)
      const interval = addProgressToImageUpload(key)
      return {...file, setIntervalFunction: interval, key}
    })
    if (flag) {
      setUploadLimitError(`Maximum file size allowed is  ${uploadFileLimit || 5}MB.`)
      return
    }
    if (uploadedFiles.length > allFiles.length) {
      setUploadLimitError(
        `Few files were not uploaded as they are bigger than maximum size allowed ${
          uploadFileLimit || 5
        }MB.`,
      )
      // return
    }
    setCallUpload(true)
    if (!isMultiple) {
      setFiles([...allFiles])
      fileInputRef.current.value = ''
      return
    }
    setFiles([...files, ...allFiles])
    fileInputRef.current.value = ''
  }

  function handleFileDelete(key: string) {
    const newFiles = uploadedFiles.filter(items => items.key !== key)
    setFiles(newFiles)
    setUploadedFiles(newFiles)
    getUploadDoc(newFiles)
  }

  const getDiffFile = () => {
    return (
      files
        ?.filter(file => !cancelledKey?.includes(file.key))
        ?.filter(file => !uploadedFiles?.find(uploadedFile => uploadedFile.key === file.key)) || []
    )
  }

  const addProgressToImageUpload = (name: string) => {
    let step = 0.5
    let currentProgress = 0
    const interval = setInterval(function () {
      currentProgress += step
      let progress = Math.round((Math.atan(currentProgress) / (Math.PI / 2)) * 100 * 1000) / 1000
      if (progress >= 70) {
        step = 0.2
      }
      setFileUploadProgress(preState => {
        const newFileUploadProgress = fileUploadProgress.find(progress => progress.name === name)
        if (newFileUploadProgress) {
          return preState.map(progress => {
            if (progress.name !== name) return progress
            return {name: name, progress: progress} as unknown as progressBarType
          })
        } else {
          return [...preState, {name: name, progress: progress}]
        }
      })
    }, 100)
    return interval
  }
  const getFileUploadProgress = (name: string) => {
    return fileUploadProgress.findLast(progress => progress.name === name)?.progress
  }
  React.useEffect(() => {
    const uploadFile = async () => {
      const newFiles = structuredClone(files)
      setIsUploading && setIsUploading(true)
      setIsFileUploadComplete(false)
      const {uploadedFiles, isUploaded} = await handleImageUpload(
        newFiles,
        type,
        undefined,
        undefined,
        customUrl,
        inventoryId,
        softwareId,
      )
      setIsFileUploadComplete(isUploaded)
      setUploadedFiles(uploadedFiles)
      setIsUploading && setIsUploading(false)
      setCallUpload(false)
    }
    if (files.length && callUpload) uploadFile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files?.length])

  React.useEffect(() => {
    getUploadDoc(uploadedFiles?.filter(file => !cancelledKey?.includes(file.key)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedFiles.length])

  React.useEffect(() => {
    if (preLoadedFiles.length >= fileUploadLimit) {
      setIsFileUploadComplete(true)
    }
  }, [])

  return (
    <>
      <input
        ref={fileInputRef}
        onClick={() => {
          if (!isInputDisabled) {
            beforeUploadHandler && beforeUploadHandler()
            fileInputRef.current.value = ''
            fileInputRef.current.click()
          }
        }}
        onChange={handleFileChange}
        type="file"
        accept={acceptedFileTypes}
        style={{display: 'none'}}
        multiple={isMultiple}
        max={10}
        disabled={disabled || files.length >= 10}
      />
      <div style={{width: '100%'}}>
        {!(
          files.filter(file => !cancelledKey.includes(file.key)).length >= fileUploadLimit &&
          isFileUploadComplete
        ) && (
          <div
            onClick={() => {
              if (!isInputDisabled) {
                beforeUploadHandler && beforeUploadHandler()
                fileInputRef.current.click()
              }
            }}
            onDrop={e => {
              if (!isInputDisabled) {
                e.preventDefault()
                e.persist()
                handleFileChange({target: {files: e.dataTransfer.files}})
              }
            }}
            className={
              customComponent
                ? ''
                : clsx(
                    classes.uploadBtn,
                    uploadBtnClassName,
                    disabled || isInputDisabled ? classes.disabledUploadBtn : '',
                  )
            }
            onDragOver={e => {
              e.preventDefault()
            }}
            onDragLeave={e => {
              e.preventDefault()
            }}
            style={{
              background: isInputDisabled ? '#F4F4F4' : '',
              cursor: disabled || isInputDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            {customComponent ? (
              customComponent
            ) : (
              <>
                <div
                  className={clsx(classes.parentContainer)}
                  style={{justifyContent: alignContent}}
                >
                  {showUploadIcon && (
                    <SVG
                      path={fileUpload}
                      // variant={disabled ? 'secondary' : 'primary'}
                      height={28}
                      width={28}
                      // customSpanStyles={{marginBottom: '10px'}}
                    />
                  )}
                  {/* <div className={clsx(classes.uploadContainer)} style={{alignItems: alignContent}}> */}
                  <div className={clsx(classes.title, disabled ? classes.disabledTitle : '')}>
                    {addDocumentText}
                  </div>
                  {/* <div className={clsx(classes.subTitle, disabled ? classes.disabledSubTitle : '')}>
                    Choose file or drag and drop here
                  </div> */}
                  <div className={clsx(classes.subTitle, disabled ? classes.disabledSubTitle : '')}>
                    <span>File Type: </span>
                    <b>{addDocumentSubtitle}</b>
                    <b> {renderFileTypes(acceptedFileTypes)}.</b>
                    <div className={classes.smallCircle}></div>
                    Max size per file: <b>{`${uploadFileLimit || 5} MB`}</b>
                    <div className={classes.smallCircle}></div>
                    Upload allowed: <b>{fileUploadLimit}</b>
                  </div>
                  {extraSubtitleText && (
                    <div
                      className={clsx(classes.subTitle, disabled ? classes.disabledSubTitle : '')}
                    >
                      {extraSubtitleText}
                    </div>
                  )}
                  {/* </div> */}
                </div>
              </>
            )}
          </div>
        )}
        {(fileUploadLimitError || !!uploadLimitError) && (
          <p className={classes.fileUploadLimitError}>{fileUploadLimitError || uploadLimitError}</p>
        )}
        {error && <p className={classes.errorMsg}>{error}</p>}
        {additionalNode}
        {showFileList && (
          <div className={clsx(classes.fileContainer, fileContainerClassName)}>
            {!!files.length &&
              [...uploadedFiles, ...getDiffFile()].map((file: UploadFileType, index) => (
                <div key={file.key + file.fileName}>
                  {cancelledKey.indexOf(file.key || '') !== -1 ? (
                    <></>
                  ) : file.isUploaded ? (
                    <div
                      className={clsx(
                        classes.singleDoc,
                        singleFileClassName,
                        disabled ? classes.uploadedFileDisabled : '',
                      )}
                      key={file.fileName ?? index}
                    >
                      <div className={classes.contentContainer}>
                        <div className={classes.dFlex}>
                          <img
                            className={classes.uploadingImg}
                            src={getFileTypeIcon(file.type || file.ext)}
                            alt="upload"
                          />
                          <div className={classes.detailsContainer}>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className={classes.fileName}
                            >
                              {file.fileName}
                            </a>
                            <div className={classes.subTitle2}>
                              {(file.ext || file.type) && (
                                <div className={classes.fileType}>
                                  {file.ext || file.type?.split('/')[1]}{' '}
                                </div>
                              )}
                              {file.size && <div className={classes.smallCircle}></div>}
                              {file.size && (
                                <div>
                                  {Number(file.size?.split(' ')[0]).toFixed(2) +
                                    ' ' +
                                    file.size?.split(' ')[1]}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div
                          className={classes.actionBtn}
                          onClick={() => handleFileDelete(file.key)}
                        >
                          <img className={classes.deleteIcon} src={deleteOutline} alt="delete" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={clsx(classes.singleDoc, singleFileClassName)}
                      key={file.fileName ?? index}
                    >
                      <div
                        className={classes.progressBar}
                        style={{width: `${getFileUploadProgress(file.key)}%`}}
                      ></div>

                      <div className={classes.contentContainer}>
                        <div className={classes.dFlex}>
                          <img
                            className={classes.uploadingImg}
                            src={getFileTypeIcon(file.type || file.ext)}
                            alt="upload"
                          />
                          <div className={classes.detailsContainer}>
                            <div className={classes.fileName}>Uploading file</div>
                            <div className={classes.subTitle2}>
                              <div className={classes.fileType}>
                                {getFileUploadProgress(file.key)?.toFixed(0)} %{' '}
                              </div>
                              <div className={classes.smallCircle}></div>
                              <div>
                                {file?.size?.split(' ')[0] &&
                                getFileUploadProgress(file.key)?.toFixed(0) &&
                                typeof Number(file?.size?.split(' ')[0]) === 'number'
                                  ? (
                                      +file?.size?.split(' ')[0] *
                                      ((Number(getFileUploadProgress(file.key)?.toFixed(0)) || 1) /
                                        100)
                                    ).toFixed(2)
                                  : ''}{' '}
                                of {file?.size}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className={classes.actionBtn}
                          onClick={() => setCancelledKey([...cancelledKey, file.key])}
                        >
                          {' '}
                          <SVG path={close} height={16} width={16} />
                        </div>
                        {/* </div> */}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  )
}
