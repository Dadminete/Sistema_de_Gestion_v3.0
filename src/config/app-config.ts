import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Sistema de Gestion 3.0",
  version: packageJson.version,
  copyright: `© ${currentYear}, Sistema de Gestion 3.0.`,
  meta: {
    title: "Sistema de Gestion 3.0 - Modern Next.js Dashboard Starter Template",
    description:
      "Sistema de Gestion 3.0 is a modern, open-source dashboard starter template built with Next.js 15, Tailwind CSS v4, and shadcn/ui. Perfect for SaaS apps, admin panels, and internal tools—fully customizable and production-ready.",
  },
};
