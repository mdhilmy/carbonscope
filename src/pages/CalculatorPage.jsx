import { useState } from 'react'
import ModeSelector from '../components/calculator/ModeSelector'
import CalculatorWizard from '../components/calculator/CalculatorWizard'

export default function CalculatorPage() {
  const [mode, setMode] = useState(null) // 'simple' | 'expert'

  if (!mode) {
    return <ModeSelector onSelectMode={setMode} />
  }

  return <CalculatorWizard mode={mode} onChangeMode={() => setMode(null)} />
}
