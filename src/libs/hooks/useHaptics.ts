import { Haptics, ImpactStyle } from '@capacitor/haptics'

export function useHaptics() {
  // Check if running in Capacitor environment
  const isCapacitor = !!(window as any).Capacitor?.isNative

  const lightImpact = async () => {
    if (!isCapacitor) return
    
    try {
      await Haptics.impact({ style: ImpactStyle.Light })
    } catch (error) {
      console.log('Haptics not available:', error)
    }
  }

  const mediumImpact = async () => {
    if (!isCapacitor) return
    
    try {
      await Haptics.impact({ style: ImpactStyle.Medium })
    } catch (error) {
      console.log('Haptics not available:', error)
    }
  }

  const heavyImpact = async () => {
    if (!isCapacitor) return
    
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy })
    } catch (error) {
      console.log('Haptics not available:', error)
    }
  }

  const selectionChanged = async () => {
    if (!isCapacitor) return
    
    try {
      await Haptics.selectionChanged()
    } catch (error) {
      console.log('Haptics not available:', error)
    }
  }

  return {
    lightImpact,
    mediumImpact,
    heavyImpact,
    selectionChanged,
  }
}
