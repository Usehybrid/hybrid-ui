import jpg from '../assets/upload/jpg.svg'
import jpeg from '../assets/upload/jpeg.svg'
import png from '../assets/upload/png.svg'
import webp from '../assets/upload/webp.svg'
import doc from '../assets/upload/doc.svg'
import csv from '../assets/upload/csv.svg'
import xls from '../assets/upload/xls.svg'
import pdf from '../assets/upload/pdf.svg'
import ppt from '../assets/upload/ppt.svg'
import fileVertical from '../assets/file-vertical.svg'
export function formatBytes(bytes: any) {
  var marker = 1024 // Change to 1000 if required
  var decimal = 3 // Change as required
  var kiloBytes = marker // One Kilobyte is 1024 bytes
  var megaBytes = marker * marker // One MB is 1024 KB
  var gigaBytes = marker * marker * marker // One GB is 1024 MB

  // return bytes if less than a KB
  if (bytes < kiloBytes) return bytes + ' Bytes'
  // return KB if less than a MB
  else if (bytes < megaBytes) return (bytes / kiloBytes).toFixed(decimal) + ' KB'
  // return MB if less than a GB
  else if (bytes < gigaBytes) return (bytes / megaBytes).toFixed(decimal) + ' MB'
  // return GB if less than a TB
  else return (bytes / gigaBytes).toFixed(decimal) + ' GB'
}

export function getFileTypeIcon(type: any) {
  if (!type) return fileVertical
  if (type.includes('jpg')) {
    return jpg
  } else if (type.includes('jpeg')) {
    return jpeg
  } else if (type.includes('png')) {
    return png
  } else if (type.includes('webp')) {
    return webp
  } else if (type.includes('xls')) {
    return xls
  } else if (type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
    return xls
  } else if (type.includes('doc')) {
    return doc
  } else if (type.includes('csv')) {
    return csv
  } else if (type.includes('pdf')) {
    return pdf
  } else if (
    type.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')
  ) {
    return ppt
  } else if (type.includes('application/vnd.ms-powerpoint')) {
    return ppt
  }

  return fileVertical
}

export function renderFileTypes(extensions: string): string {
  const extensionMap: Record<string, string> = {
    'application/pdf': 'PDF',
    '.doc': 'Doc',
    '.docx': 'Docx',
    'image/png': 'PNG',
    'image/jpeg': 'JPEG, JPG',
    'image/webp': 'WEBP',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Xlsx',
    'application/vnd.ms-excel': 'Xls',
  }

  const extensionList = extensions.split(',').map(ext => ext.trim())

  const fileTypesSet = new Set<string>()

  extensionList.forEach(extension => {
    const fileType = extensionMap[extension]
    if (fileType) {
      fileType.split(', ').forEach(type => fileTypesSet.add(type))
    }
  })

  const fileTypes = Array.from(fileTypesSet)

  if (fileTypes.length === 0) return ''
  if (fileTypes.length === 1) return `${fileTypes[0]} only`

  return `${fileTypes.slice(0, -1).join(', ')} and ${fileTypes[fileTypes.length - 1]}`
}
