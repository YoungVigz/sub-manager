export const generateGreenShades = (count: number) => {
    const colors: string[] = []
    const primary = [93, 214, 44] // #5dd62c
    const secondary = [51, 116, 24] // #337418

    for (let i = 0; i < count; i++) {
      const ratio = count === 1 ? 0.5 : i / (count - 1)
      const r = Math.round(secondary[0] + (primary[0] - secondary[0]) * ratio)
      const g = Math.round(secondary[1] + (primary[1] - secondary[1]) * ratio)
      const b = Math.round(secondary[2] + (primary[2] - secondary[2]) * ratio)
      colors.push(`rgb(${r}, ${g}, ${b})`)
    }
    return colors
}