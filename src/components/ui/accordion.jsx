import * as React from "react"
import { ChevronDown } from "lucide-react"

const AccordionContext = React.createContext()

export function Accordion({ type, collapsible, children, className }) {
  const [openItems, setOpenItems] = React.useState([])

  const toggleItem = (value) => {
    if (type === 'single') {
      setOpenItems(prev => prev.includes(value) ? [] : [value])
    }
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  )
}

export function AccordionItem({ value, children, className }) {
  return (
    <div className={className}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { value })
      )}
    </div>
  )
}

export function AccordionTrigger({ value, children, className }) {
  const { openItems, toggleItem } = React.useContext(AccordionContext)
  const isOpen = openItems.includes(value)

  return (
    <button
      onClick={() => toggleItem(value)}
      className={`flex items-center justify-between w-full py-4 font-medium transition-all ${className}`}
    >
      {children}
      <ChevronDown
        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
  )
}

export function AccordionContent({ value, children, className }) {
  const { openItems } = React.useContext(AccordionContext)
  const isOpen = openItems.includes(value)

  if (!isOpen) return null

  return (
    <div className={`pb-4 ${className}`}>
      {children}
    </div>
  )
}