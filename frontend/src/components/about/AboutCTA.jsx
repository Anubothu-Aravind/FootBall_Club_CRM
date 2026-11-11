import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const AboutCTA = () => {
  return (
    <section className="py-20 px-6 max-md:py-16 max-[480px]:py-12 relative overflow-hidden bg-linear-to-br from-white via-rose-50 to-white">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,207,232,0.3),transparent_50%)] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Headline */}
          <h2 className="text-4xl font-extrabold text-black mb-4 max-md:text-3xl max-[480px]:text-2xl">
            Ready to Start Your Journey?
          </h2>

          {/* Reassurance text */}
          <p className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto max-md:text-base">
            Join hundreds of young athletes who are developing their skills,
            character, and passion for football in a supportive environment.
          </p>

          {/* CTA Buttons - Fitts's Law: Large tap targets */}
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-orange-600 to-red-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 min-h-14 min-w-40 text-base max-[480px]:w-full"
              aria-label="Book a trial session"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Book Free Trial
            </Link>

            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-800 text-gray-800 font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:bg-gray-800 hover:text-white min-h-14 min-w-40 text-base max-[480px]:w-full"
              aria-label="Contact the academy"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Contact Us
            </a>
          </div>

          {/* Trust reinforcement */}
          <div className="mt-10 flex justify-center items-center gap-8 flex-wrap text-gray-700 text-sm max-[480px]:gap-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-rose-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold">No commitment required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-rose-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold">Flexible schedules</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-rose-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold">All skill levels welcome</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutCTA;
