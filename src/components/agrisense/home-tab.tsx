'use client'

import { DashboardTab } from './dashboard-tab'
import { IrrigationTab } from './irrigation-tab'
import { AiDiagnosis } from './ai-diagnosis'

export function HomeTab() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in-50 duration-500">
      <div className="flex flex-col gap-2 mb-2">
        <h2 className="text-2xl font-black text-primary">Fandraisana</h2>
        <p className="text-muted-foreground text-sm">Topi-maso ny fambolenao</p>
      </div>

      <DashboardTab />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IrrigationTab />
        <AiDiagnosis />
      </div>
    </div>
  )
}
