import { motion } from "framer-motion";

/**
 * Modern Timeline Component
 * Displays a vertical timeline with alternating left-right layout
 * Years displayed in center circles, with jersey images
 */
const ModernTimeline = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10 px-6">
        <p>No timeline items to display</p>
      </div>
    );
  }

  return (
    <section className="w-full max-w-4xl mx-auto py-8 px-6">
      <div className="relative">
        {/* Background line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-linear-to-b from-gray-200 via-red-600 to-gray-200 -translate-x-1/2 z-[1] max-md:left-[30px] max-[480px]:left-[25px]" />

        {/* Animated line */}
        <motion.div
          className="absolute left-1/2 top-0 w-1 bg-red-600 -translate-x-1/2 origin-top shadow-[0_0_15px_rgba(220,38,38,0.4)] z-[1] max-md:left-[30px] max-[480px]:left-[25px]"
          initial={{ scaleY: 0 }}
          whileInView={{
            scaleY: 1,
            transition: {
              duration: 1.2,
              ease: "easeOut",
              delay: 0.2,
            },
          }}
          viewport={{ once: true }}
        />

        <div className="flex flex-col gap-[100px] relative py-[60px] max-lg:gap-20 max-md:gap-[60px] max-md:py-[30px] max-[480px]:gap-[50px]">
          {items.map((item, index) => {
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={index}
                className={`grid items-center relative gap-0 max-md:gap-5 ${
                  isLeft
                    ? 'grid-cols-[1fr_auto_1fr] [grid-template-areas:"jersey_year_card"] max-md:grid-cols-[auto_1fr] max-md:[grid-template-areas:"year_card"_"year_jersey"]'
                    : 'grid-cols-[1fr_auto_1fr] [grid-template-areas:"card_year_jersey"] max-md:grid-cols-[auto_1fr] max-md:[grid-template-areas:"year_card"_"year_jersey"]'
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.6,
                    delay: index * 0.15,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  },
                }}
                viewport={{ once: true, margin: "-50px" }}
              >
                {/* Jersey Image */}
                {item.jerseyImage && (
                  <motion.div
                    className="[grid-area:jersey] flex justify-center items-center px-[30px] max-md:px-0 max-md:pt-5 max-md:justify-start"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{
                      opacity: 1,
                      scale: 1,
                      transition: {
                        duration: 0.5,
                        delay: index * 0.15 + 0.2,
                      },
                    }}
                    whileHover={{ scale: 1.05, rotateY: 15 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="w-[280px] h-[280px] rounded-[20px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.1)] bg-linear-to-br from-gray-50 to-white transition-all duration-400 relative perspective-[1000px] hover:shadow-[0_15px_50px_rgba(220,38,38,0.2),0_10px_30px_rgba(0,0,0,0.15),0_0_0_1px_rgba(220,38,38,0.1)] hover:-translate-y-[5px] max-lg:w-[220px] max-lg:h-[220px] max-md:w-full max-md:max-w-75 max-md:h-60 max-[480px]:h-50 group">
                      <img
                        src={item.jerseyImage}
                        alt={`${item.year} Jersey`}
                        className="w-full h-full object-cover block transition-transform duration-400 group-hover:scale-[1.08]"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Year Circle on Center Line */}
                <motion.div
                  className="[grid-area:year] w-[110px] h-[110px] rounded-full bg-linear-to-br from-red-600 via-red-500 to-red-400 shadow-[0_10px_30px_rgba(220,38,38,0.35),0_0_0_6px_rgba(255,255,255,1),0_0_0_10px_rgba(220,38,38,0.15),inset_0_2px_8px_rgba(255,255,255,0.3)] flex items-center justify-center shrink-0 relative z-10 cursor-pointer transition-all duration-400 border-[3px] border-white/80 hover:shadow-[0_15px_40px_rgba(220,38,38,0.45),0_0_0_6px_rgba(255,255,255,1),0_0_0_14px_rgba(220,38,38,0.2),inset_0_2px_8px_rgba(255,255,255,0.4)] hover:scale-110 max-lg:w-[90px] max-lg:h-[90px] max-md:w-[75px] max-md:h-[75px] max-md:justify-self-center max-[480px]:w-[65px] max-[480px]:h-[65px]"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{
                    scale: 1,
                    rotate: 0,
                    transition: {
                      duration: 0.6,
                      delay: index * 0.15 + 0.1,
                      type: "spring",
                      stiffness: 200,
                    },
                  }}
                  whileHover={{ scale: 1.15, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-[28px] font-extrabold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.3)] tracking-[1.5px] font-sans max-lg:text-[22px] max-md:text-lg max-[480px]:text-base">
                    {item.year}
                  </span>
                </motion.div>

                {/* Card Content */}
                <motion.div
                  className="[grid-area:card] bg-linear-to-br from-white/98 to-gray-50/95 backdrop-blur-md border-2 border-red-600/12 rounded-[20px] p-8 mx-[30px] shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-all duration-400 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[5px] before:bg-linear-to-r before:from-red-600 before:via-red-500 before:to-red-600 before:scale-x-0 before:origin-left before:transition-transform before:duration-500 hover:before:scale-x-100 hover:border-red-600/25 hover:shadow-[0_15px_40px_rgba(220,38,38,0.18),0_10px_20px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 max-lg:p-[26px] max-md:mx-0 max-md:p-[22px] max-[480px]:p-[18px]"
                  initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                    transition: {
                      duration: 0.6,
                      delay: index * 0.15 + 0.3,
                    },
                  }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative z-[1]">
                    <h3 className="text-[26px] font-bold text-gray-900 mb-3.5 transition-colors duration-300 leading-[1.3] hover:text-red-600 max-md:text-[22px] max-[480px]:text-xl">
                      {item.title}
                    </h3>
                    <p className="text-base leading-[1.8] text-gray-500 mb-[18px] max-md:text-[15px] max-[480px]:text-sm">
                      {item.description}
                    </p>

                    {item.category && (
                      <span className="inline-block py-2 px-[18px] bg-gradient-to-br from-red-600/[0.12] to-red-500/[0.06] text-red-600 text-[13px] font-bold rounded-full border-[1.5px] border-red-600/25 uppercase tracking-[0.8px] transition-all duration-300 hover:bg-gradient-to-br hover:from-red-600/[0.18] hover:to-red-500/10 hover:border-red-600/40 hover:-translate-y-0.5">
                        {item.category}
                      </span>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ModernTimeline;
