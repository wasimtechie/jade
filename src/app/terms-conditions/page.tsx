import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsConditions() {
  return (
    <main className="min-h-screen bg-[#0B2C23] text-white font-manrope">
      <Navbar />
      <section className="relative pt-24 pb-16 px-6 md:px-12 lg:px-24 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <p className="font-manrope text-gh-label tracking-[0.3em] uppercase text-[#EFCD62]/70 mb-3 text-center md:text-left">
            Legal
          </p>
          <h1 className="text-gh-h1 font-philosopher mb-3 border-b border-[#EFCD62]/30 pb-5 text-center md:text-left">
            Terms & Conditions
          </h1>
          <p className="text-[#EFCD62] text-gh-label font-bold uppercase tracking-[0.2em] text-center md:text-left">
            Last Updated: 5th December, 2023
          </p>
        </div>
      </section>

      <section className="jade-section px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Personal Information */}
          <section>
            <h2 className="text-gh-h2 font-philosopher mb-5 text-[#EFCD62]">
              Personal Information
            </h2>
            <ul className="space-y-3 text-gh-body text-white/70 leading-relaxed list-none">
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">1.</span>
                <span>
                  We collect and store information when you voluntarily send us
                  electronic mail, register on our site, or fill out a form.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">2.</span>
                <span>
                  Information collected may include your name, email address, or
                  phone number.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">3.</span>
                <span>
                  Your information will be used to respond to your inquiries,
                  and if you provide contact details, we may contact you about
                  our products and offers.
                </span>
              </li>
            </ul>
          </section>

          {/* Booking and Payment */}
          <section>
            <h2 className="text-gh-h2 font-philosopher mb-5 text-[#EFCD62]">
              Booking and Payment
            </h2>
            <ul className="space-y-3 text-gh-body text-white/70 leading-relaxed list-none">
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">1.</span>
                <span>
                  50% advance payment is required at the time of booking, and
                  the remaining 50% is due 24 hours before check-in.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">2.</span>
                <span>
                  Please present your Aadhar card, Driver’s License, or Passport
                  during booking and check-in.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">3.</span>
                <span>
                  An indemnity form must be filled at the time of check-in.
                </span>
              </li>
            </ul>
          </section>

          {/* Check-in/Check-out */}
          <section>
            <h2 className="text-gh-h2 font-philosopher mb-5 text-[#EFCD62]">
              Check-in/Check-out
            </h2>
            <ul className="space-y-3 text-gh-body text-white/70 leading-relaxed list-none">
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">1.</span>
                <span>Check-in: 1 pm / Check-out: 11 am.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">2.</span>
                <span>
                  Extension of checkout time is subject to management approval
                  with a 50% charge on tariff.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">3.</span>
                <span>Check-in after 10 pm is considered as canceled.</span>
              </li>
            </ul>
          </section>

          {/* Guest Responsibilities */}
          <section>
            <h2 className="text-gh-h2 font-philosopher mb-5 text-[#EFCD62]">
              Guest Responsibilities
            </h2>
            <ul className="space-y-3 text-gh-body text-white/70 leading-relaxed list-none">
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">1.</span>
                <span>
                  Adhere to the promised number of guests without exceeding it.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">2.</span>
                <span>
                  Some properties are pet-friendly; inform us during reservation
                  if bringing pets.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">3.</span>
                <span>
                  Limit liquor to 2.3 liters; extra liquor is not the
                  responsibility of Jade.
                </span>
              </li>
            </ul>
          </section>

          {/* Prohibited Items */}
          <section>
            <h2 className="text-gh-h2 font-philosopher mb-5 text-[#EFCD62]">
              Prohibited Items
            </h2>
            <ul className="space-y-3 text-gh-body text-white/70 leading-relaxed list-none">
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">1.</span>
                <span>
                  Strictly prohibited: Arms, drugs, illicit substances, hookah,
                  vape, bursting crackers.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">2.</span>
                <span>
                  Damages will be charged as per management's valuation.
                </span>
              </li>
            </ul>
          </section>

          {/* Pool Policy */}
          <section>
            <h2 className="text-gh-h2 font-philosopher mb-5 text-[#EFCD62]">
              Pool Policy
            </h2>
            <ul className="space-y-3 text-gh-body text-white/70 leading-relaxed list-none">
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">1.</span>
                <span>No F&B consumption in or around the pool.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">2.</span>
                <span>Property speakers are not to be used by the pool.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">3.</span>
                <span>Pets are not allowed in the pool.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">4.</span>
                <span>Charges apply for pool refilling.</span>
              </li>
            </ul>
          </section>

          {/* Smoking Policy */}
          <section>
            <h2 className="text-gh-h2 font-philosopher mb-5 text-[#EFCD62]">
              Smoking Policy
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-bold text-gh-body mb-3 uppercase tracking-wider underline decoration-[#EFCD62] underline-offset-8">
                  No Smoking Inside the Villa
                </h3>
                <p className="text-gh-body text-white/70 leading-relaxed">
                  Smoking inside the villa is strictly prohibited. This
                  includes, but is not limited to, all indoor areas such as
                  bedrooms, bathrooms, living rooms, kitchens, and any enclosed
                  spaces within the villa premises.
                </p>
              </div>
              <div>
                <h3 className="text-white font-bold text-gh-body mb-3 uppercase tracking-wider underline decoration-[#EFCD62] underline-offset-8">
                  Outdoor Smoking
                </h3>
                <p className="text-gh-body text-white/70 leading-relaxed">
                  Guests are permitted to smoke outside the villa in designated
                  smoking areas only. It is the guest's responsibility to ensure
                  that all cigarette butts and smoking-related litter are
                  properly disposed of in the provided receptacles.
                </p>
              </div>
              <div>
                <h3 className="text-white font-bold text-gh-body mb-3 uppercase tracking-wider underline decoration-[#EFCD62] underline-offset-8">
                  Smoking Damage Liability
                </h3>
                <ul className="space-y-3 text-gh-body text-white/70 leading-relaxed list-none">
                  <li className="flex gap-3">
                    <span className="text-[#EFCD62] font-bold">1.</span>
                    <span>
                      Any damage caused by smoking, such as cigarette burns,
                      stains, or holes in the villa's furniture, upholstery,
                      carpets, or any other property, will result in charges to
                      the guest.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#EFCD62] font-bold">2.</span>
                    <span>
                      Guests will be held financially responsible for the full
                      replacement cost of the damaged item(s). For example, if a
                      cigarette burn damages a sofa, the guest will be charged
                      for the entire cost of replacing the sofa, not just the
                      repair of the damaged section.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#EFCD62] font-bold">3.</span>
                    <span>
                      The assessment of damages and the corresponding charges
                      will be at the sole discretion of the villa management.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cancellation Policy */}
          <section>
            <h2 className="text-gh-h2 font-philosopher mb-5 text-[#EFCD62]">
              Cancellation Policy
            </h2>
            <ul className="space-y-3 text-gh-body text-white/70 leading-relaxed list-none">
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">1.</span>
                <span>No refund on any bookings.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">2.</span>
                <span>
                  Credit note for cancellations made more than 14 days before
                  check-in.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">3.</span>
                <span>
                  Cancellations within 14 days are non-cancelable; no refund or
                  credit note.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">4.</span>
                <span>
                  Credit note valid on weekdays (Mon-Thu) and not on weekends or
                  public holidays; use within 3 months of check-in.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">5.</span>
                <span>
                  Prices cannot be reduced after booking; increases may apply
                  for additional guests.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">6.</span>
                <span>
                  Credit note value may vary based on the utilization month.
                </span>
              </li>
            </ul>
          </section>

          {/* General Guidelines */}
          <section>
            <h2 className="text-gh-h2 font-philosopher mb-5 text-[#EFCD62]">
              General Guidelines
            </h2>
            <ul className="space-y-3 text-gh-body text-white/70 leading-relaxed list-none">
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">1.</span>
                <span>Liquor not allowed near the pool within 5 feet.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">2.</span>
                <span>Avoid placing drinks and food near the pool.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">3.</span>
                <span>
                  Music and movies above the legal limit are discouraged after
                  10 pm.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#EFCD62] font-bold">4.</span>
                <span>
                  Treat our property team with kindness and respect for your
                  safety and comfort.
                </span>
              </li>
            </ul>
          </section>

          {/* Refundable Deposit */}
          <section>
            <h2 className="text-gh-h2 font-philosopher mb-5 text-[#EFCD62]">
              Refundable Deposit
            </h2>
            <p className="text-gh-body text-white/70 leading-relaxed">
              A refundable security deposit, starting at ₹10,000 and subject to
              variation depending on the type of booking, will be collected upon
              check-in. This deposit will be fully refunded upon check-out,
              contingent upon the condition of the premises and any potential
              damages incurred during the stay.
            </p>
          </section>

          <footer className="pt-20 text-center border-t border-white/5">
            <h3 className="text-gh-h3 font-philosopher mb-3">Thank You!</h3>
            <p className="text-white/40 text-gh-desc font-manrope tracking-widest uppercase">
              With Regards,
              <br />
              Jade Hospitainment!
            </p>
          </footer>
        </div>
      </section>
      <Footer />
    </main>
  );
}
