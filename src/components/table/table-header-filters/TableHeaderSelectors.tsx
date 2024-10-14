import {SelectorsV2} from '../../selectors-v2'
import {TableStore} from '../store'
import type {FilterOptions, InternalTableFilters} from '../types'

interface TableHeaderFilterProps {
  filter: FilterOptions
  tableFilters: TableStore['filters']
  tableFilter: InternalTableFilters
  addFilters: TableStore['addFilters']
  removeFilters: TableStore['removeFilters']
  resetFilters: (filterKey: string, filterDispatch: any) => void
  filterDispatch: (value: any) => void
}

export default function TableHeaderSelectors({
  filter,
  tableFilters,
  addFilters,
  filterDispatch,
}: TableHeaderFilterProps) {
  const filterOptions = filter?.options.map(option => ({
    value: option.value,
    label: option.name,
  }))

  const selectorHandler = (value: string) => {
    addFilters(filter.key, value, filterDispatch)
  }

  const selectedValue =
    (tableFilters.find(option => {
      return option.key === filter.key
    })?.values as string) || ''

  return <SelectorsV2 options={filterOptions} value={selectedValue} onChange={selectorHandler} />
}
