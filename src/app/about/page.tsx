import AboutLegacyPage from "./AboutLegacyPage";

export { metadata } from "./layout";

export const revalidate = 60;

export default function AboutPage() {
  return <AboutLegacyPage />;
}
