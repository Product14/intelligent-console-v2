/**@format */
import React, {useEffect, useState} from "react"
import styles from "../../../styles/common/datePicker.module.css"
import {DateRangePicker, DateRange} from "react-date-range"
import {upsertQueryParams} from "../../utils"
import {useRouter} from "next/router"

function DatePicker(props) {
    const [selectionRange, setSelectionRange] = useState({startDate: new Date(), endDate: new Date(), key: "selection"})
    const router = useRouter()
    useEffect(() => {
        setSelectionRange({startDate: props.startDate, endDate: props.endDate, key: "selection"})
    }, [props.startDate, props.endDate])

    // const selectionRange = {
    //   startDate: props.startDate,
    //   endDate: props.endDate,
    //   key: 'selection'
    // }
    const selectionColor = ["#4600f214", "#4600f2"]

    // const handleDateSelect = async ranges => {
    //     try {
    //         let startDateDate = ranges?.selection?.startDate.getDate()
    //         let startDateMonth = ranges?.selection?.startDate.getMonth() + 1
    //         let startDateYear = ranges?.selection?.startDate.getFullYear()
    //         let endDateDate = ranges?.selection?.endDate.getDate()
    //         let endDateMonth = ranges?.selection?.endDate.getMonth() + 1
    //         let endDateYear = ranges?.selection?.endDate.getFullYear()
    //         let formattedEndDate = `${endDateYear}-${endDateMonth}-${endDateDate}`
    //         let formattedStartDate = `${startDateYear}-${startDateMonth}-${startDateDate}`
    //         if (ranges?.selection?.startDate === ranges?.selection?.endDate) {
    //             // console.log("equal")
    //             // append single value created_on
    //             let formattedDate = `${endDateYear}-${endDateMonth}-${endDateDate}`
    //             await upsertQueryParams({variable: "created_on", deleteVariable: true, router})
    //             await upsertQueryParams({variable: "created_on", value: formattedStartDate, isAList: true, router})
    //         } else if (ranges?.selection?.startDate > ranges?.selection?.endDate) {
    //             // append two values
    //             await upsertQueryParams({variable: "created_on", deleteVariable: true, router})

    //             await upsertQueryParams({variable: "created_on", value: formattedEndDate, isAList: true, router})
    //             await upsertQueryParams({variable: "created_on", value: formattedStartDate, isAList: true, router})
    //         } else if (ranges?.selection?.startDate < ranges?.selection?.endDate) {
    //             await upsertQueryParams({variable: "created_on", deleteVariable: true, router})

    //             await upsertQueryParams({variable: "created_on", value: formattedStartDate, isAList: true, router})
    //             await upsertQueryParams({variable: "created_on", value: formattedEndDate, isAList: true, router})
    //         }

    //         props.setStartDate(ranges?.selection?.startDate)
    //         props.setEndDate(ranges?.selection?.endDate)
    //         setSelectionRange({startDate: ranges?.selection?.startDate, endDate: ranges?.selection?.endDate, key: "selection"})
    //         if(props.handleFilterCall()) props.handleFilterCall()
    //     } catch (err) {
    //         console.log(err)
    //     }
    // }
    const handleDateSelect = async ranges => {
        try {
            let startDate = ranges?.selection?.startDate
            let endDate = ranges?.selection?.endDate

            if (!props?.isCreditSystem) {
                // Format dates
                const formatDate = date => {
                    let dateDate = date.getDate()
                    let dateMonth = date.getMonth() + 1 // Months are 0-based
                    let dateYear = date.getFullYear()
                    return `${dateYear}-${dateMonth}-${dateDate}`
                }

                const formattedStartDate = formatDate(startDate)
                const formattedEndDate = formatDate(endDate)

                // // Update query parameters based on date selection
                await upsertQueryParams({variable: "created_on", deleteVariable: true, router})

                if (startDate.getTime() === endDate.getTime()) {
                    // If start date and end date are the same
                    await upsertQueryParams({variable: "created_on", value: formattedStartDate, isAList: true, router})
                    endDate.setDate(endDate.getDate() + 1)
                } else if (startDate > endDate) {
                    // If start date is greater than end date
                    await upsertQueryParams({variable: "created_on", value: formattedEndDate, isAList: true, router})
                    await upsertQueryParams({variable: "created_on", value: formattedStartDate, isAList: true, router})
                } else if (startDate < endDate) {
                    // If start date is less than end date
                    await upsertQueryParams({variable: "created_on", value: formattedStartDate, isAList: true, router})
                    await upsertQueryParams({variable: "created_on", value: formattedEndDate, isAList: true, router})
                }

                props?.setIsDateFilterActive(true)

                // Additional function call if needed
                if (props.handleFilterCall && !props?.isInventoryPageBar) props.handleFilterCall()
            }
            // Update state
            props?.setStartDate(startDate)
            props?.setEndDate(endDate)
            if (props?.isInventoryPageBar || props?.isCreditSystem || props?.integrationsPageBar) {
                props?.setDatePickerUsed(true)
            }

            setSelectionRange({startDate: startDate, endDate: endDate, key: "selection"})
        } catch (err) {
            console.log(err, "no date")
        }
    }

    const today = new Date()
    return (
        <div className={styles["date-search-wrapper"]}>
            {/*TODO date range picker*/}
            <DateRange
                className={[styles[("date-search", "")]].join(" ")}
                showMonthAndYearPickers={false}
                rangeColors={["#4600f2", "#4600f214", "#000000"]}
                // color='#4600f2'
                minDate={props?.setMinDate ? new Date(props.setMinDate) : new Date(2000, 0, 1)}
                maxDate={today}
                ranges={[selectionRange]}
                onChange={handleDateSelect}
                retainEndDateOnFirstSelection={true}
                moveRangeOnFirstSelection={false}
            />
        </div>
    )
}

export default DatePicker
