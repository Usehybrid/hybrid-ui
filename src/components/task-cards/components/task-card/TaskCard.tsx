import * as React from 'react'
import clsx from 'clsx'
import infoOctagon from '../../../assets/info-octagon.svg'
import deleteBin from '../../../assets/delete-bin.svg'
import classes from './task-card.module.css'
import {useNavigate} from 'react-router-dom'
import {UserChip} from '../../../user-chip'
import {Badge, BADGE_HIGHLIGHT, BADGE_STATUS} from '../../../badge'
import {BUTTON_V2_SIZE, BUTTON_V2_VARIANT, ButtonV2} from '../../../button-v2'
import {ITask, ITaskDetails, ITaskObjectValue} from '../../types'
import {
  getDefaultFormattedDateTime,
  isArrayOfString,
  isExactISODateFormat,
  isObject,
  isString,
} from '../../../../utils'
import {getUsername} from '../../../../utils/text'
import getStatus, {TASK_STATUS} from '../../helper'
import {isDatePassedOrSame} from '../../../../utils/date'

const HIDE_DETAILS = ['profile']
const HIDE_CANCEL_REQUEST = ['profile', 'attendance', 'it-request']

export default function TaskCard({
  data,
  onClicks,
  idx,
}: {
  data: ITask
  onClicks?: any
  idx: number
}) {
  const navigate = useNavigate()

  const menuItems = [
    {
      label: 'See details',
      onClick: (data: ITask) => {
        if (typeof onClicks[idx] !== 'undefined') {
          onClicks[idx](data)
          return
        }
        if (data.module_reference === 'attendance') {
          // @ts-ignore
          navigate(`/attendance/approve/${data.task_details_id}`)
          return
        }
        navigate(`/${data.module_reference}/${data.task_details_id}`, {
          state: {source: location.pathname},
        })
      },
      iconSrc: infoOctagon,
      hidden: HIDE_DETAILS.includes(data.module_reference),
    },
    {
      label: 'Cancel request',
      onClick: (data: ITask) => {
        if (typeof onClicks[idx] !== 'undefined') {
          onClicks[idx](data)
          return
        }
        navigate(`/${data.module_reference}/${data.task_details_id}?cancel=${true}`, {
          state: {source: location.pathname},
        })
      },
      iconSrc: deleteBin,
      customStyles: {color: 'var(--status-error-e50)'},
      customSvgClassName: classes.logoutIcon,
      hidden:
        HIDE_CANCEL_REQUEST.includes(data.module_reference) ||
        data.status === TASK_STATUS.CANCELLED ||
        data.status === TASK_STATUS.DECLINED ||
        data.status === TASK_STATUS.PENDING_CANCELLATION ||
        (data.module_reference === 'leave' && isDatePassedOrSame(data?.leaveFrom)),
    },
  ].filter(action => !action.hidden)

  return (
    <div className={classes.card}>
      <div className={classes.taskSection}>
        <div className={clsx(classes.taskName, 'zap-content-semibold')}>{data.name}</div>
        <div className={clsx(classes.dateAndTime, 'zap-caption-medium')}>
          {isExactISODateFormat(data.date) ? getDefaultFormattedDateTime(data.date) : data.date}
        </div>
        <Badge
          highlight={BADGE_HIGHLIGHT.ICON}
          icon={data.icon_url}
          status={moduleStatusMap[data.module_reference] || BADGE_STATUS.DEFAULT}
          customSvgStyles={{width: '16px', height: '16px'}}
        >
          {data.module_name}
        </Badge>
      </div>
      <div className={classes.detailsSection}>
        {data.details?.map((detail: ITaskDetails, i: number) => (
          <div key={i} className={classes.detail}>
            <div className={clsx(classes.detailKey, 'zap-subcontent-medium')}>{detail.key}</div>
            {Array.isArray(detail.value) && detail.value.length > 0 ? (
              isArrayOfString(detail.value) ? (
                <div className={clsx(classes.detailValue, 'zap-subcontent-medium')}>
                  {(detail.value as string[]).join(', ')}
                </div>
              ) : (
                <div className={classes.detailValueAttachments}>
                  {detail.value?.map((value, index: React.Key) => {
                    return (
                      <div key={index} className={classes.detailValueAttachment}>
                        <div>
                          <img src={value.details.icon} width={20} alt={`${value.details.type}`} />
                        </div>
                        <div>
                          <a
                            href={value.doc_link}
                            target="_blank"
                            className={classes.attachmentName}
                          >
                            {value.file_name}
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            ) : detail.value && isObject(detail.value) && Object.keys(detail.value).length ? (
              <UserChip
                username={getUsername(detail.value)}
                profileImgUrl={(detail.value as ITaskObjectValue).profile_img_url}
              />
            ) : isString(detail.value) ? (
              <div className={clsx(classes.detailValue, 'zap-subcontent-medium')}>
                {detail.value as string}
              </div>
            ) : (
              <div className={clsx(classes.detailValueNA, 'zap-subcontent-medium')}>N/A</div>
            )}
          </div>
        ))}
      </div>
      <div className={classes.statusSection}>
        <Badge highlight={BADGE_HIGHLIGHT.DOT} status={statusMap[data.status]}>
          {getStatus(data.status)}
        </Badge>
      </div>
      <div className={classes.actionSection}>
        {!!menuItems?.length && (
          <ButtonV2.ActionsDropdown
            menuItems={menuItems}
            variant={BUTTON_V2_VARIANT.TERTIARY}
            size={BUTTON_V2_SIZE.SMALL}
            customData={data}
          />
        )}
      </div>
    </div>
  )
}

const moduleStatusMap: {[key: string]: BADGE_STATUS} = {
  profile: BADGE_STATUS.DEFAULT,
  leave: BADGE_STATUS.DEFAULT,
  it_request: BADGE_STATUS.NEGATIVE,
  attendance: BADGE_STATUS.HIGHLIGHT,
  reimbursement: BADGE_STATUS.DEFAULT,
  document: BADGE_STATUS.HIGHLIGHT,
}

const statusMap: {[key: string]: BADGE_STATUS} = {
  [TASK_STATUS.PENDING]: BADGE_STATUS.WARNING,
  [TASK_STATUS.DECLINED]: BADGE_STATUS.NEGATIVE,
  [TASK_STATUS.PENDING_SECOND_APPROVER]: BADGE_STATUS.WARNING,
  [TASK_STATUS.CANCELLED]: BADGE_STATUS.NEGATIVE,
  [TASK_STATUS.APPROVED]: BADGE_STATUS.POSITIVE,
  [TASK_STATUS.PENDING_CANCELLATION]: BADGE_STATUS.WARNING,
}
