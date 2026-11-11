/**
 * About Page Component
 * Displays information about Anantapur Football Club
 * Composed of separate section components with hardcoded content
 */

import AboutHero from "../components/about/AboutHero";
import ClubJerseys from "../components/about/ClubJerseys";
import OurMission from "../components/about/OurMission";
import CoreValues from "../components/about/CoreValues";
import OurJourney from "../components/about/OurJourney";
import CoachingPhilosophy from "../components/about/CoachingPhilosophy";
import YouthPathway from "../components/about/YouthPathway";
import FacilitiesCommunity from "../components/about/FacilitiesCommunity";

const About = () => {
  return (
    <div className="w-full">
      <AboutHero />
      <ClubJerseys />
      <OurMission />
      <CoreValues />
      <OurJourney />
      <CoachingPhilosophy />
      <YouthPathway />
      <FacilitiesCommunity />
    </div>
  );
};

export default About;
