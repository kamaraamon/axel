"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <div className="chart-skeleton" aria-label="Chargement du graphique" />,
});

type Props = {
  options: ApexOptions;
  series: NonNullable<ApexOptions["series"]>;
  type: "area" | "bar" | "donut" | "radialBar";
  height?: number;
};

export function ApexChart({ options, series, type, height = 270 }: Props) {
  return (
    <ReactApexChart
      options={options}
      series={series}
      type={type}
      height={height}
    />
  );
}

export const baseChartOptions: ApexOptions = {
  chart: {
    fontFamily: "Montserrat, sans-serif",
    toolbar: { show: false },
    animations: { enabled: true, speed: 500 },
  },
  colors: ["#FF7900", "#2B62AC", "#16A34A"],
  dataLabels: { enabled: false },
  grid: { borderColor: "#E2E8F0", strokeDashArray: 4 },
  tooltip: { theme: "light" },
};
