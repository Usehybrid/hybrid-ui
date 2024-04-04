import * as React from 'react'
import * as menu from '@zag-js/menu'
import clsx from 'clsx'
import FilterCheckbox from './FilterCheckbox'
import FilterTooltip from './FilterTooltip'
import chevronDown from '../../assets/chevron-down.svg'
import classes from './styles.module.css'
import {useMachine, normalizeProps} from '@zag-js/react'
import {SVG} from '../../svg'
import {Search} from '../../search'
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

export default function TableHeaderFilter({
  filter,
  tableFilters,
  tableFilter,
  addFilters,
  removeFilters,
  resetFilters,
  filterDispatch,
}: TableHeaderFilterProps) {
  const [search, setSearch] = React.useState('')
  const [state, send] = useMachine(
    menu.machine({
      id: filter['id'],
      closeOnSelect: false,
    }),
  )
  const api = menu.connect(state, send, normalizeProps)

  const filteredOptions = filter?.options.filter(option => {
    if (!option.name) return false
    return option.name.toLowerCase().includes(search.toLowerCase())
  })

  const selectedFilters = tableFilter?.values.length

  const handleResetFilter = () => {
    resetFilters(tableFilter?.key, filterDispatch)
    api.close()
  }

  const getIsChecked = (value: string) => {
    let isChecked = false
    tableFilters.forEach(filter => {
      filter.values.forEach(obj => {
        if (obj === value) {
          isChecked = true
          return
        }
      })
    })
    return isChecked
  }

  return (
    <>
      <button
        className={clsx('hybr1d-ui-reset-btn', classes.filter, api.isOpen && classes.filterActive)}
        {...api.triggerProps}
      >
        <FilterTooltip
          filter={filter}
          tableFilter={tableFilter}
          selectedFilters={selectedFilters}
        />
        <SVG path={chevronDown} svgClassName={classes.filterIcon2} />
      </button>

      <div {...api.positionerProps} className={classes.positioner}>
        {api.isOpen && (
          <div {...api.contentProps} className={classes.dropdown} onKeyDown={() => {}}>
            {!filter.config?.hideSearch && (
              <div className={classes.dropdownSearch}>
                <Search
                  id="filter-search"
                  search={search}
                  setSearch={setSearch}
                  placeholder={filter.config?.placeholder || 'Search'}
                />
              </div>
            )}

            <div className={classes.options}>
              {filteredOptions.length === 0 ? (
                <div className={classes.optionsEmpty}>No results found</div>
              ) : (
                filteredOptions.map((option, idx) => (
                  <div
                    key={idx}
                    {...api.getItemProps({value: option.value})}
                    className={classes.option}
                  >
                    <FilterCheckbox
                      label={option.name}
                      value={option.value}
                      filterKey={filter.key}
                      addFilters={addFilters}
                      removeFilters={removeFilters}
                      checked={getIsChecked(option.value)}
                      filterDispatch={filterDispatch}
                      countryCode={option.country_code}
                      key={option.value}
                      customName={option.customName}
                    />
                  </div>
                ))
              )}
            </div>

            <div className={classes.footerBox}>
              <div className={classes.footer}>
                <button
                  className={clsx('hybr1d-ui-reset-btn', classes.resetBtn)}
                  onClick={handleResetFilter}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
