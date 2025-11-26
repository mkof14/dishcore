import * as React from "react"

const TabsContext = React.createContext()

export function Tabs({ value, defaultValue, onValueChange, children, className }) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || value)
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const handleValueChange = (newValue) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }) {
  return (
    <div className={`inline-flex rounded-lg p-1 ${className}`}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className }) {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext)
  const isActive = value === selectedValue

  return (
    <button
      onClick={() => onValueChange(value)}
      className={`px-4 py-2 rounded-md transition-colors ${
        isActive ? 'bg-white/10' : 'hover:bg-white/5'
      } ${className}`}
      style={{ color: 'var(--text-primary)' }}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }) {
  const { value: selectedValue } = React.useContext(TabsContext)
  
  if (value !== selectedValue) return null
  
  return (
    <div className={className}>
      {children}
    </div>
  )
}