import React from "react"
import PropTypes from "prop-types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const BottomButton = ({ text, colorClass, icon, onClick }) => {
    return (
        <button
            type="button"
            className={`btn btn-block no-border ${colorClass}`}
            onClick={onClick}
        >
            <FontAwesomeIcon size="lg" icon={icon} className="mr-2"/>
            {text}
        </button>
    )
}

BottomButton.propTupes = {
    text: PropTypes.string,
    colorClass: PropTypes.string,
    icon: PropTypes.string,
    onClick: PropTypes.func
}

BottomButton.defaultProps = {
    text: "新建"
}

export default BottomButton