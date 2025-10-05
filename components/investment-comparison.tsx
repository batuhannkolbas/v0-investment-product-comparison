"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, BarChart3, LineChartIcon, TrendingUp, Wallet, Target } from "lucide-react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type InvestmentProduct = {
  id: string
  name: string
  nameTr: string
  color: string
}

type TimePeriod = {
  id: string
  label: string
  labelTr: string
  days: number
}

type Currency = "TL" | "USD" | "EUR"

const availableProducts: InvestmentProduct[] = [
  { id: "xu100", name: "BIST 100", nameTr: "XU100 - BIST 100", color: "#3B82F6" },
  { id: "usd", name: "US Dollar", nameTr: "USD - Amerikan Doları", color: "#10B981" },
  { id: "ao2", name: "Gold Deposit", nameTr: "AO2 - Vadesiz Altın", color: "#A78BFA" },
  { id: "standard", name: "Standard Deposit", nameTr: "Standart Vadeli", color: "#F59E0B" },
  { id: "euro", name: "Euro", nameTr: "EUR - Euro", color: "#EF4444" },
  { id: "silver", name: "Silver", nameTr: "Gümüş", color: "#94A3B8" },
  { id: "funds", name: "Funds", nameTr: "Yatırım Fonları", color: "#EC4899" },
]

const timePeriods: TimePeriod[] = [
  { id: "daily", label: "Daily", labelTr: "Günlük", days: 1 },
  { id: "weekly", label: "Weekly", labelTr: "Haftalık", days: 7 },
  { id: "monthly", label: "Monthly", labelTr: "Aylık", days: 30 },
  { id: "3months", label: "3 Months", labelTr: "3 Aylık", days: 90 },
  { id: "6months", label: "6 Months", labelTr: "6 Aylık", days: 180 },
  { id: "yearly", label: "Yearly", labelTr: "Yıllık", days: 365 },
  { id: "3years", label: "3 Years", labelTr: "3 Yıllık", days: 1095 },
  { id: "5years", label: "5 Years", labelTr: "5 Yıllık", days: 1825 },
]

// Generate mock data based on selected products and time period
function generateMockData(products: InvestmentProduct[], period: TimePeriod, amount: number, currency: Currency) {
  const baseReturns: Record<string, number> = {
    xu100: 982.84,
    usd: 1002.52,
    ao2: 1015.47,
    standard: 1000.86,
    euro: 995.32,
    silver: 1008.15,
    funds: 1025.67,
  }

  const periodMultiplier = period.days / 7

  return products.map((product) => {
    const baseValue = baseReturns[product.id]
    const value = Number((amount * (baseValue / 1000) * periodMultiplier).toFixed(2))
    return {
      name: product.name,
      nameTr: product.nameTr,
      value: value,
      fill: product.color,
    }
  })
}

// Generate time series data for line chart
function generateTimeSeriesData(products: InvestmentProduct[], period: TimePeriod, amount: number) {
  const dataPoints = Math.min(period.days, 30)
  const interval = Math.ceil(period.days / dataPoints)

  const data = []
  for (let i = 0; i <= dataPoints; i++) {
    const point: any = { day: i * interval }
    products.forEach((product) => {
      const baseReturn = {
        xu100: 982.84,
        usd: 1002.52,
        ao2: 1015.47,
        standard: 1000.86,
        euro: 995.32,
        silver: 1008.15,
        funds: 1025.67,
      }[product.id]

      const volatility = Math.random() * 0.02 - 0.01
      const progress = i / dataPoints
      point[product.id] = Number((amount * (baseReturn / 1000) * progress * (1 + volatility)).toFixed(2))
    })
    data.push(point)
  }
  return data
}

export default function InvestmentComparison() {
  const [selectedProducts, setSelectedProducts] = useState<InvestmentProduct[]>([
    availableProducts[0],
    availableProducts[1],
    availableProducts[2],
    availableProducts[3],
  ])
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(timePeriods[1])
  const [previousPeriod, setPreviousPeriod] = useState<TimePeriod | null>(null)
  const [previousChartData, setPreviousChartData] = useState<any[]>([])
  const [chartType, setChartType] = useState<"bar" | "line">("bar")
  const [amount, setAmount] = useState<number>(1000)
  const [currency, setCurrency] = useState<Currency>("TL")
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [portfolioProducts, setPortfolioProducts] = useState<InvestmentProduct[]>([
    availableProducts[0],
    availableProducts[1],
  ])
  const [goalAmount, setGoalAmount] = useState<number>(10000)
  const [goalProduct, setGoalProduct] = useState<InvestmentProduct>(availableProducts[0])
  const [goalPeriod, setGoalPeriod] = useState<TimePeriod>(timePeriods[5])
  const [activeMode, setActiveMode] = useState<"comparison" | "portfolio" | "dynamic" | "goal">("comparison")

  const handleToggleProduct = (product: InvestmentProduct) => {
    const isSelected = selectedProducts.find((p) => p.id === product.id)
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id))
    } else {
      if (selectedProducts.length < 7) {
        setSelectedProducts([...selectedProducts, product])
      }
    }
  }

  const handleTogglePortfolioProduct = (product: InvestmentProduct) => {
    const isSelected = portfolioProducts.find((p) => p.id === product.id)
    if (isSelected) {
      setPortfolioProducts(portfolioProducts.filter((p) => p.id !== product.id))
    } else {
      if (portfolioProducts.length < 7) {
        setPortfolioProducts([...portfolioProducts, product])
      }
    }
  }

  const handlePeriodChange = (period: TimePeriod) => {
    setPreviousPeriod(selectedPeriod)
    setPreviousChartData(chartData)
    setSelectedPeriod(period)
  }

  const chartData = generateMockData(selectedProducts, selectedPeriod, amount, currency)
  const timeSeriesData = generateTimeSeriesData(selectedProducts, selectedPeriod, amount)
  const portfolioChartData = generateMockData(portfolioProducts, selectedPeriod, amount, currency)

  const goalResult = (() => {
    const baseReturn = {
      xu100: 982.84,
      usd: 1002.52,
      ao2: 1015.47,
      standard: 1000.86,
      euro: 995.32,
      silver: 1008.15,
      funds: 1025.67,
    }[goalProduct.id]

    const periodMultiplier = goalPeriod.days / 7
    const finalAmount = amount * (baseReturn / 1000) * periodMultiplier
    const willReachGoal = finalAmount >= goalAmount
    const difference = finalAmount - goalAmount

    return { finalAmount, willReachGoal, difference }
  })()

  const chartConfig = selectedProducts.reduce(
    (acc, product) => {
      acc[product.id] = {
        label: product.nameTr,
        color: product.color,
      }
      return acc
    },
    {} as Record<string, { label: string; color: string }>,
  )

  const combinedChartData = chartData.map((current, index) => {
    const previous = previousChartData[index]
    return {
      ...current,
      previousValue: previous?.value || 0,
    }
  })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-4 bg-primary px-4 py-4 text-primary-foreground shadow-md">
        <button className="rounded-lg p-2 hover:bg-primary/90">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">Yatırım Karşılaştırma</h1>
      </header>

      <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as any)} className="flex-1">
        <div className="border-b bg-card">
          <TabsList className="grid w-full grid-cols-4 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="comparison"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Karşılaştırma
            </TabsTrigger>
            <TabsTrigger
              value="portfolio"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Portföy
            </TabsTrigger>
            <TabsTrigger
              value="dynamic"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Dinamik
            </TabsTrigger>
            <TabsTrigger
              value="goal"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Target className="mr-2 h-4 w-4" />
              Hedef
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="comparison" className="mt-0 space-y-6 p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Yatırım Tutarı</label>
            <div className="relative">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="h-14 rounded-xl border-2 pr-16 text-lg"
              />
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger className="absolute right-2 top-1/2 h-10 w-14 -translate-y-1/2 border-0 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TL">TL</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <div className="rounded-xl bg-card p-4 shadow-sm">
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <ComposedChart data={combinedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      {previousPeriod && <Bar dataKey="previousValue" radius={[8, 8, 0, 0]} fillOpacity={0.2} />}
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                    </ComposedChart>
                  ) : (
                    <LineChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="day" tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      {selectedProducts.map((product) => (
                        <Line
                          key={product.id}
                          type="monotone"
                          dataKey={product.id}
                          stroke={product.color}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </ChartContainer>
              {previousPeriod && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Soluk çubuklar: {previousPeriod.labelTr} | Koyu çubuklar: {selectedPeriod.labelTr}
                </p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center justify-between px-2">
                {timePeriods.map((period, index) => (
                  <button
                    key={period.id}
                    onClick={() => handlePeriodChange(period)}
                    className="relative flex flex-col items-center gap-2"
                  >
                    <div
                      className={`h-3 w-3 rounded-full border-2 transition-all ${
                        selectedPeriod.id === period.id
                          ? "scale-125 border-primary bg-primary"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selectedPeriod.id === period.id && (
                        <div className="absolute -inset-2 rounded-full border-2 border-primary" />
                      )}
                    </div>
                    <span
                      className={`text-xs ${
                        selectedPeriod.id === period.id ? "font-semibold text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {period.labelTr}
                    </span>
                  </button>
                ))}
              </div>
              <div className="absolute left-0 right-0 top-[6px] -z-10 h-0.5 bg-gray-300" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Para Birimi</p>
              <div className="flex gap-2">
                {(["TL", "USD", "EUR"] as Currency[]).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                      currency === curr
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Grafik Tipi</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartType("bar")}
                  className={`rounded-lg p-2 transition-all ${
                    chartType === "bar"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setChartType("line")}
                  className={`rounded-lg p-2 transition-all ${
                    chartType === "line"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <LineChartIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {chartData.map((item) => (
              <div key={item.nameTr} className="flex items-center justify-between rounded-xl bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded" style={{ backgroundColor: item.fill }} />
                  <span className="font-medium text-card-foreground">{item.nameTr}</span>
                </div>
                <span className="text-lg font-bold text-primary">
                  {item.value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                  {currency}
                </span>
              </div>
            ))}
          </div>

          <Button
            onClick={() => setShowProductSelector(!showProductSelector)}
            className="h-14 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Karşılaştırılacak Ürün Ekle
          </Button>

          {showProductSelector && (
            <div className="space-y-3 rounded-xl bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-card-foreground">Ürün Seç ({selectedProducts.length}/7)</h3>
                <button onClick={() => setShowProductSelector(false)} className="text-muted-foreground">
                  Kapat
                </button>
              </div>
              <div className="space-y-2">
                {availableProducts.map((product) => {
                  const isSelected = selectedProducts.find((p) => p.id === product.id)
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleToggleProduct(product)}
                      disabled={!isSelected && selectedProducts.length >= 7}
                      className={`flex w-full items-center gap-3 rounded-lg p-3 transition-all ${
                        isSelected
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "bg-secondary hover:bg-secondary/80 disabled:opacity-50"
                      }`}
                    >
                      <div className="h-4 w-4 rounded" style={{ backgroundColor: product.color }} />
                      <span className="font-medium">{product.nameTr}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="portfolio" className="mt-0 space-y-6 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Portföyüm
              </CardTitle>
              <CardDescription>Sahip olduğunuz yatırım ürünlerini karşılaştırın</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Başlangıç Yatırımı</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="h-12 rounded-xl"
                />
              </div>

              {portfolioProducts.length > 0 && (
                <div className="rounded-xl bg-muted p-4">
                  <ChartContainer
                    config={portfolioProducts.reduce(
                      (acc, product) => {
                        acc[product.id] = { label: product.nameTr, color: product.color }
                        return acc
                      },
                      {} as Record<string, { label: string; color: string }>,
                    )}
                    className="h-[280px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={portfolioChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#6B7280", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-semibold">Portföy Ürünleri</h4>
                {portfolioChartData.map((item) => (
                  <div key={item.nameTr} className="flex items-center justify-between rounded-xl bg-muted p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded" style={{ backgroundColor: item.fill }} />
                      <span className="font-medium">{item.nameTr}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {item.value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                        {currency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        +
                        {(((item.value - amount) / amount) * 100).toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        %
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Portföy Ürünlerini Düzenle</h4>
                <div className="space-y-2">
                  {availableProducts.map((product) => {
                    const isSelected = portfolioProducts.find((p) => p.id === product.id)
                    return (
                      <button
                        key={product.id}
                        onClick={() => handleTogglePortfolioProduct(product)}
                        disabled={!isSelected && portfolioProducts.length >= 7}
                        className={`flex w-full items-center gap-3 rounded-lg p-3 transition-all ${
                          isSelected
                            ? "bg-primary/10 ring-2 ring-primary"
                            : "bg-secondary hover:bg-secondary/80 disabled:opacity-50"
                        }`}
                      >
                        <div className="h-4 w-4 rounded" style={{ backgroundColor: product.color }} />
                        <span className="font-medium">{product.nameTr}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dynamic" className="mt-0 space-y-6 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Dinamik Kar/Zarar Analizi
              </CardTitle>
              <CardDescription>Seçilen dönemden bugüne kar/zarar değişimini görün</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Yatırım Tutarı</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Dönem Seçin</label>
                <Select
                  value={selectedPeriod.id}
                  onValueChange={(v) => setSelectedPeriod(timePeriods.find((p) => p.id === v)!)}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timePeriods.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.labelTr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-xl bg-muted p-4">
                <ChartContainer config={chartConfig} className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="day"
                        label={{ value: "Gün", position: "insideBottom", offset: -5 }}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        label={{ value: "Değer", angle: -90, position: "insideLeft" }}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      {selectedProducts.map((product) => (
                        <Line
                          key={product.id}
                          type="monotone"
                          dataKey={product.id}
                          stroke={product.color}
                          strokeWidth={3}
                          dot={false}
                          name={product.nameTr}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Ürünleri Seç</h4>
                <div className="space-y-2">
                  {availableProducts.map((product) => {
                    const isSelected = selectedProducts.find((p) => p.id === product.id)
                    return (
                      <button
                        key={product.id}
                        onClick={() => handleToggleProduct(product)}
                        disabled={!isSelected && selectedProducts.length >= 7}
                        className={`flex w-full items-center gap-3 rounded-lg p-3 transition-all ${
                          isSelected
                            ? "bg-primary/10 ring-2 ring-primary"
                            : "bg-secondary hover:bg-secondary/80 disabled:opacity-50"
                        }`}
                      >
                        <div className="h-4 w-4 rounded" style={{ backgroundColor: product.color }} />
                        <span className="font-medium">{product.nameTr}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goal" className="mt-0 space-y-6 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Hedefe Ulaşır mıyım?
              </CardTitle>
              <CardDescription>Yatırımınızın hedefinize ulaşıp ulaşmayacağını simüle edin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Başlangıç Yatırımı</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Hedef Tutar</label>
                <Input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(Number(e.target.value))}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Yatırım Ürünü</label>
                <Select
                  value={goalProduct.id}
                  onValueChange={(v) => setGoalProduct(availableProducts.find((p) => p.id === v)!)}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.nameTr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Yatırım Süresi</label>
                <Select
                  value={goalPeriod.id}
                  onValueChange={(v) => setGoalPeriod(timePeriods.find((p) => p.id === v)!)}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timePeriods.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.labelTr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div
                className={`rounded-xl p-6 ${
                  goalResult.willReachGoal
                    ? "bg-green-50 border-2 border-green-500"
                    : "bg-red-50 border-2 border-red-500"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Başlangıç</span>
                    <span className="text-lg font-bold">
                      {amount.toLocaleString("tr-TR")} {currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Hedef</span>
                    <span className="text-lg font-bold">
                      {goalAmount.toLocaleString("tr-TR")} {currency}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Tahmini Sonuç</span>
                    <span className="text-xl font-bold text-primary">
                      {goalResult.finalAmount.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {currency}
                    </span>
                  </div>
                  <div className="rounded-lg bg-white p-4 text-center">
                    {goalResult.willReachGoal ? (
                      <div>
                        <p className="text-2xl font-bold text-green-600">✓ Hedefe Ulaşırsınız!</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Hedefinizi{" "}
                          {Math.abs(goalResult.difference).toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          {currency} fazlasıyla aşarsınız
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-2xl font-bold text-red-600">✗ Hedefe Ulaşamazsınız</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Hedefinize{" "}
                          {Math.abs(goalResult.difference).toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          {currency} eksik kalırsınız
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-muted p-4">
                <h4 className="mb-3 font-semibold">Diğer Ürünlerle Karşılaştırma</h4>
                <div className="space-y-2">
                  {availableProducts.map((product) => {
                    const baseReturn = {
                      xu100: 982.84,
                      usd: 1002.52,
                      ao2: 1015.47,
                      standard: 1000.86,
                      euro: 995.32,
                      silver: 1008.15,
                      funds: 1025.67,
                    }[product.id]
                    const periodMultiplier = goalPeriod.days / 7
                    const finalAmount = amount * (baseReturn / 1000) * periodMultiplier
                    const willReach = finalAmount >= goalAmount

                    return (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between rounded-lg p-3 ${
                          willReach ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-4 w-4 rounded" style={{ backgroundColor: product.color }} />
                          <span className="font-medium">{product.nameTr}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {finalAmount.toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            {currency}
                          </p>
                          <p className="text-xs">{willReach ? "✓ Ulaşır" : "✗ Ulaşmaz"}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
