import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RefundPolicy() {
  return (
    <main className="min-h-screen bg-[#0B2C23] text-white font-manrope">
      <Navbar />
      <section className="relative pt-24 pb-16 px-6 md:px-12 lg:px-24 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <p className="font-manrope text-gh-label tracking-[0.3em] uppercase text-[#EFCD62]/70 mb-3 text-center md:text-left">
            Legal
          </p>
          <h1 className="text-gh-h1 font-philosopher mb-3 border-b border-[#EFCD62]/30 pb-5 text-center md:text-left">
            Refund Policy
          </h1>
        </div>
      </section>

      <section className="jade-section px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto space-y-10">
          <section>
            <p className="text-gh-body text-white/70 leading-relaxed mb-6">
              When you voluntarily send us electronic mail, we will keep a
              record of this information so that we can respond to you. We only
              collect information from you when you register on our site or fill
              out a form. Also, when filling out a form on our site, you may be
              asked to enter your: name, e-mail address or phone number. You
              may, however, visit our site anonymously. In case you have
              submitted your personal information and contact details, we
              reserve the rights to Call, SMS, Email or WhatsApp about our
              products and offers, even if your number has DND activated on it.
            </p>
          </section>

          {/* Booking */}
          <section>
            <h2 className="text-gh-h2 font-philosopher mb-5 text-[#EFCD62]">
              Booking
            </h2>
            <ul className="space-y-3 text-gh-body text-white/70 leading-relaxed list-none">
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">1.</span>
                <span>
                  Payment of 50% advance to be made at the time of booking and
                  balance 50% 24 hour prior to check in time.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">2.</span>
                <span>
                  ID proofs of all guests are mandatory and need to be submitted
                  before check-in.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">3.</span>
                <span>
                  Possessing any illegal drugs is strictly prohibited.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">4.</span>
                <span>
                  Adherence to the Government's accepted level of sound and
                  ensure that music isn't played loudly after 10 pm.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">5.</span>
                <span>No Check in allowed after 10 pm.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">6.</span>
                <span>
                  Liquor quantity as per government policy should not be more
                  than 2.2 ltrs.
                </span>
              </li>
            </ul>
          </section>

          {/* Credit Note */}
          <section className="bg-white/5 border border-white/10 p-8 rounded-sm">
            <p className="text-gh-body text-white/90 leading-relaxed">
              A credit note will be provided for the paid amount, valid for 3
              months post the check in date (can be availed on weekends if
              booking was made for weekend. E.g. If booking made for Saturday it
              can be availed on Friday/ Saturday/Sunday. If booking made for
              Friday/ Sunday it cannot be availed for Saturday.)
            </p>
          </section>

          <footer className="pt-20 text-center border-t border-white/5">
            <h3 className="text-gh-h3 font-philosopher mb-3">Thank You!</h3>
            <p className="text-white/40 text-gh-desc font-manrope tracking-widest uppercase">
              With Regards,
              <br />
              Jade Retreats!
            </p>
          </footer>
        </div>
      </section>
      <Footer />
    </main>
  );
}
