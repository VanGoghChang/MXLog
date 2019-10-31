import React from "react"
import PropTypes from "prop-types"
import classNames from "classnames"
import { timeStampSerialize } from "../utils/helper"

const Table = ({ titles, dataSource, tableHeight, itemOnClick }) => {
    const createTableContent = () => {
        return (
            dataSource.map((item, index) => {
                const fClassName = classNames({
                    "table-danger": item.Type === "app_start",
                })
                return (
                    <tr key={index} onClick={() => { itemOnClick(index, item.Content) }}>
                        <td>{timeStampSerialize(item.TimeStamp)}</td>
                        <td>{item.Type}</td>
                        <td>{item.Content}</td>
                    </tr>
                )
            })
        )
    }

    return (
        <div className="table-responsive" style={{ height: tableHeight-22 }}>
            <table className="table table-hover">
                <thead>
                    <tr>
                        {
                            titles.map(item => {
                                return <th key={item}>{item}</th>
                            })
                        }
                    </tr>
                </thead>
                <tbody>
                    {createTableContent()}
                </tbody>
            </table>
        // </div>    
    )
}


Table.propTypes = {
    titles: PropTypes.array,
    dataSource: PropTypes.array,
    itemOnClick: PropTypes.func,
}

export default Table