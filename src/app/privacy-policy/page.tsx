import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy and booking-data practices for Jade Hospitainment: how enquiries, Villa stays, weddings, and site usage are handled in Karnataka/Bangalore-based operations.",
  alternates: { canonical: "https://jadehospitainment.com/privacy-policy" },
  openGraph: {
    title: "Privacy Policy | Jade Hospitainment",
    description:
      "Privacy Policy and Booking Rules covering Jade Hospitainment digital platforms and retreats.",
    url: "https://jadehospitainment.com/privacy-policy",
    locale: "en_IN",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0B2C23] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 md:px-12 lg:px-24 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <p className="font-manrope text-gh-label tracking-[0.3em] uppercase text-[#EFCD62]/70 mb-3 text-center md:text-left">
            Legal
          </p>
          <h1 className="font-philosopher text-gh-h1 md:text-5xl text-white leading-tight text-center md:text-left">
            Privacy Policy & <br />
            <span className="italic text-[#EFCD62]">Booking Rules</span>
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="jade-section px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Privacy Policy */}
          <div className="space-y-5">
            <h2 className="font-philosopher text-gh-h2 text-[#EFCD62] border-b border-[#EFCD62]/20 pb-4">
              Privacy Policy
            </h2>
            <div className="font-manrope text-gh-body text-white/80 leading-relaxed space-y-3">
              <p>
                When you voluntarily send us electronic mail, we will keep a
                record of this information so that we can respond to you. We
                only collect information from you when you register on our site
                or fill out a form. Also, when filling out a form on our site,
                you may be asked to enter your: name, e-mail address or phone
                number. You may, however, visit our site anonymously.
              </p>
              <p>
                In case you have submitted your personal information and contact
                details, we reserve the rights to Call, SMS, Email or WhatsApp
                about our products and offers, even if your number has DND
                activated on it.
              </p>
            </div>
          </div>

          {/* Booking Rules */}
          <div className="space-y-5">
            <h2 className="font-philosopher text-gh-h2 text-[#EFCD62] border-b border-[#EFCD62]/20 pb-4">
              Booking Rules & Guidelines
            </h2>
            <ul className="font-manrope text-gh-body text-white/80 leading-relaxed space-y-3 list-decimal pl-6">
              <li>
                Payment of 50% advance to be made at the time of booking and
                balance 50% 24 hour prior to check in time.
              </li>
              <li>
                ID proofs of all guests are mandatory and need to be submitted
                before check-in.
              </li>
              <li>Possessing any illegal drugs is strictly prohibited.</li>
              <li>
                Adherence to the Government's accepted level of sound and ensure
                that music isn't played loudly after 10 pm.
              </li>
              <li>No Check in allowed after 10 pm.</li>
              <li>
                Liquor quantity as per government policy should not be more than
                2.2 ltrs.
              </li>
            </ul>
          </div>

          {/* Credit Note Policy */}
          <div className="space-y-5">
            <h2 className="font-philosopher text-gh-h2 text-[#EFCD62] border-b border-[#EFCD62]/20 pb-4">
              Credit Note Policy
            </h2>
            <div className="font-manrope text-gh-body text-white/80 leading-relaxed bg-white/5 p-8 border border-white/10 italic">
              <p>
                "A credit note will be provided for the paid amount, valid for 3
                months post the check in date (can be availed on weekends if
                booking was made for weekend. E.g. If booking made for Saturday
                it can be availed on Friday/ Saturday/Sunday. If booking made
                for Friday/ Sunday it cannot be availed for Saturday.)"
              </p>
            </div>
          </div>

          {/* Conclusion */}
          <div className="pt-8 text-center md:text-left border-t border-white/10">
            <p className="font-philosopher text-gh-h3 text-white">Thank You!</p>
            <p className="font-manrope text-gh-body text-white/60 mt-2">
              With Regards, <br />
              <span className="text-[#EFCD62] font-semibold">
                Jade Retreats!
              </span>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
