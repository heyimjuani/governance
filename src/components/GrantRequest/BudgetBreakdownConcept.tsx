import React from 'react'

import { BudgetBreakdownConcept as BudgetBreakdownConceptType } from '../../entities/Grant/types'
import ChevronRightCircleOutline from '../Icon/ChevronRightCircleOutline'

import './BudgetBreakdownConcept.css'

interface Props {
  item: BudgetBreakdownConceptType
  onClick: () => void
}

const BUDGET_FORMAT_OPTIONS = {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}

const BudgetBreakdownConcept = ({ item, onClick }: Props) => {
  const { concept, estimatedBudget, duration } = item

  return (
    <div role="button" className="BudgetBreakdownConcept" onClick={onClick}>
      <div>
        <h3 className="BudgetBreakdownConcept__Concept">{concept}</h3>
        <span className="BudgetBreakdownConcept__Duration">{duration} months</span>
      </div>
      <div className="BudgetBreakdownConcept__BudgetContainer">
        <span className="BudgetBreakdownConcept__Budget">
          {Number(estimatedBudget).toLocaleString(undefined, BUDGET_FORMAT_OPTIONS)}
        </span>
        <ChevronRightCircleOutline />
      </div>
    </div>
  )
}

export default BudgetBreakdownConcept
