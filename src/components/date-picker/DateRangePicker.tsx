import * as React from 'react'
import clsx from 'clsx'
import calender from '../assets/calender.svg'
import chevronDown from '../assets/chevron-down.svg'
import chevronLeft from '../assets/chevron-left.svg'
import chevronRight from '../assets/chevron-right.svg'
import classes from './date-range-picker.module.css'
import {DateRange, DayPicker, useDayPicker} from 'react-day-picker'
import {addDays, addMonths, addYears, isBefore, isSameDay} from 'date-fns'
import {create} from 'zustand'
import {useMediaQuery} from '../../hooks'
import {BUTTON_SIZE, BUTTON_TYPE, BUTTON_VARIANT, Button} from '../button'
import {InputControlV2, LabelV2} from '../input-v2'
import {Popover, PopoverContent, PopoverTrigger} from '../popover'
import {SelectV2} from '../select-v2'
import {SVG} from '../svg'
import {dateFormatter, RANGE_OPTIONS} from './constants'
import type {DateRangePickerProps, DateStore, MonthYear} from './type'

const useDateStore = create<DateStore>()(set => ({
  monthYear: {
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  },
  setMonthYear: (value: MonthYear) => set({monthYear: value}),
}))

export function DateRangePicker({
  value,
  onChange,
  mode = 'range',
  datePickerClassNames,
  showQuickSelect = false,
  disabled,
  customDisable,
  disableDatepicker = false,
  disableWeekends = false,
  showOutsideDays = false,
  errorMsg = '',
  customInputContentStyles,
  customClasses = {},
  size = BUTTON_SIZE.DEFAULT,
  onReset,
  placeholder,
  trigger,
  ...props
}: DateRangePickerProps) {
  const date = value
  const monthYear = useDateStore(state => state.monthYear)
  const setMonthYear = useDateStore(state => state.setMonthYear)
  const [selectedRange, setSelectedRange] = React.useState(RANGE_OPTIONS[0])
  const [hoverRange, setHoverRange] = React.useState<DateRange | undefined>(undefined)

  const displayDate = React.useMemo(() => {
    if (!date?.from) return placeholder || 'Pick a date'
    if (date.to) {
      if (isSameDay(date.from, date.to)) {
        return dateFormatter.format(date.from)
      } else {
        return `${dateFormatter.format(date.from)} - ${dateFormatter.format(date.to)}`
      }
    } else {
      return dateFormatter.format(date.from)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, placeholder])

  const onSelect = (values?: DateRange) => {
    if (showQuickSelect && selectedRange.value !== RANGE_OPTIONS[0].value) {
      setSelectedRange(RANGE_OPTIONS[0])
    }

    const start = values?.from ?? undefined
    const end = values?.to ?? values?.from
    onChange({from: start, to: end})
  }

  React.useEffect(() => {
    if (date?.from && date?.to) {
      setHoverRange({from: date.from, to: date.to})
    }
  }, [date])

  React.useEffect(() => {
    if (date?.from && !isNaN(new Date(date.from).getTime())) {
      setMonthYear({
        month: new Date(date.from).getMonth(),
        year: new Date(date.from).getFullYear(),
      })
    }
  }, [date])

  const onDropdownClick = (value: any) => {
    const today = new Date()

    const selected = RANGE_OPTIONS.find(option => option.value === value) ?? RANGE_OPTIONS[0]
    setSelectedRange(selected)
    switch (value) {
      case 'today':
        onChange({from: today, to: today})
        break
      case 'ytd':
        onChange({
          from: new Date(today.getFullYear(), 0, 1),
          to: today,
        })
        break
      case '7days':
        onChange({
          from: addDays(today, -7),
          to: today,
        })
        break
      case '1month':
        onChange({
          from: addMonths(today, -1),
          to: today,
        })
        break
      case '3months':
        onChange({
          from: addMonths(today, -3),
          to: today,
        })
        break
      case '6months':
        onChange({
          from: addMonths(today, -6),
          to: today,
        })
        break
      case '1year':
        onChange({
          from: addYears(today, -1),
          to: today,
        })
        break
      case 'custom':
        break
      default:
        onChange({from: value, to: value})
        break
    }
  }

  const isMobile = useMediaQuery('(max-width: 640px)')

  return (
    <div className={clsx(classes.dateRangePicker)}>
      <Popover placement={props.placement ? props.placement : 'bottom'}>
        <PopoverTrigger openOnHover={false}>
          {trigger ? (
            trigger
          ) : (
            <Button
              variant={BUTTON_VARIANT.GHOST}
              customStyles={{width: '100%'}}
              disabled={disableDatepicker}
              size={size}
            >
              <div className={clsx(classes.formButton, customClasses.contentContainer)}>
                <span
                  style={{
                    color: !date ? 'var(--text-secondary)' : undefined,
                    ...customInputContentStyles,
                  }}
                  className={customClasses.content}
                >
                  {showQuickSelect && selectedRange.value !== RANGE_OPTIONS[0].value
                    ? selectedRange.label
                    : displayDate}
                </span>
                {showQuickSelect ? (
                  <SVG
                    path={chevronDown}
                    width={20}
                    height={20}
                    svgClassName={customClasses.dateIcon}
                  />
                ) : (
                  <SVG
                    path={calender}
                    width={20}
                    height={20}
                    svgClassName={customClasses.dateIcon}
                  />
                )}
              </div>
            </Button>
          )}
          {errorMsg && (
            <p className={clsx('zap-subcontent-medium', classes.errorMsg)}>{errorMsg}</p>
          )}
        </PopoverTrigger>
        <PopoverContent
          bg="var(--neutral-white)"
          className={classes.popoverContent}
          positionerStyles={{zIndex: 20}}
        >
          {showQuickSelect && (
            <InputControlV2 className={classes.quickRangePicker}>
              <LabelV2 htmlFor="range-selector">Select a date range</LabelV2>
              <SelectV2
                id="range-selector"
                options={RANGE_OPTIONS}
                defaultValue={selectedRange as any}
                onChange={onDropdownClick}
                value={selectedRange}
                mainContainerClassName={classes.quickSelector}
              />
            </InputControlV2>
          )}
          <DayPicker
            showOutsideDays={showOutsideDays}
            endMonth={new Date(2050, 0)}
            classNames={{
              months: classes.months,
              month: classes.month,
              month_caption: classes.caption,
              caption_label: classes.captionLabel,
              nav: classes.nav,
              button_previous: classes.navButtonPrevious,
              button_next: classes.navButtonNext,
              month_grid: classes.table,
              weekdays: classes.headRow,
              weekday: classes.headCell,
              week: classes.row,
              day: classes.cell,
              selected: classes.daySelected,
              today: classes.dayToday,
              outside: classes.dayOutside,
              disabled: classes.dayDisabled,
              range_start: classes.dayRangeStart,
              range_end: classes.dayRangeEnd,
              range_middle: classes.dayRangeMiddle,
              hidden: classes.dayHidden,
              day_button: classes.day,
              ...(datePickerClassNames ? datePickerClassNames : {}),
            }}
            components={{
              Nav,
            }}
            mode={mode}
            defaultMonth={date?.from}
            selected={date}
            onSelect={onSelect}
            numberOfMonths={isMobile ? 1 : 2}
            onDayMouseEnter={day => {
              if (date?.from && (!date?.to || isSameDay(date.from, date.to))) {
                const from = isBefore(day, date.from) ? day : date.from
                const to = isBefore(day, date.from) ? date.from : day
                const range = {from, to}
                setHoverRange(range)
              }
            }}
            onDayMouseLeave={() => {
              setHoverRange(undefined)
            }}
            disabled={
              customDisable
                ? customDisable
                : date => {
                    if (disabled && typeof disabled === 'boolean') return disabled
                    if (disableWeekends) return date.getDay() === 0 || date.getDay() === 6
                    return false
                  }
            }
            modifiers={{
              highlighted: day => {
                if (hoverRange?.from && hoverRange?.to) {
                  return day >= hoverRange.from && day <= hoverRange.to
                }
                return false
              },
            }}
            modifiersClassNames={{
              highlighted: classes.dayHighlighted,
            }}
            month={new Date(monthYear.year, monthYear.month)}
            {...props}
          />
          {onReset && (
            <button className={clsx('zap-reset-btn', classes.resetBtn)} onClick={onReset}>
              Reset
            </button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

function Nav() {
  const monthYear = useDateStore(state => state.monthYear)
  const setMonthYear = useDateStore(state => state.setMonthYear)
  const {nextMonth, previousMonth} = useDayPicker()
  return (
    <div className={classes.navContainer}>
      <Button
        disabled={!previousMonth}
        type={BUTTON_TYPE.ICON_ONLY}
        size={BUTTON_SIZE.SMALL}
        variant={BUTTON_VARIANT.SECONDARY}
        onClick={e => {
          e.preventDefault()
          setMonthYear({
            year: monthYear.month === 0 ? monthYear.year - 1 : monthYear.year,
            month: monthYear.month === 0 ? 11 : monthYear.month - 1,
          })
        }}
        icon={<SVG path={chevronLeft} width={20} height={20} />}
      ></Button>
      <Button
        disabled={!nextMonth}
        type={BUTTON_TYPE.ICON_ONLY}
        size={BUTTON_SIZE.SMALL}
        variant={BUTTON_VARIANT.SECONDARY}
        onClick={e => {
          e.preventDefault()
          setMonthYear({
            year: monthYear.month === 11 ? monthYear.year + 1 : monthYear.year,
            month: monthYear.month === 11 ? 0 : monthYear.month + 1,
          })
        }}
        icon={<SVG path={chevronRight} width={20} height={20} />}
      ></Button>
    </div>
  )
}
