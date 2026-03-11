import BasicInformation from "../../view/step-one/BasicInformation";
import BehaviourManagement from "../../view/step-one/BehaviourManagement";
import Communication from "../../view/step-one/Communication";
import ConcernsAndChallenges from "../../view/step-one/ConcernsAndChallenges";
import SelfManagement from "../../view/step-one/SelfManagement";
import SessionHighlights from "../../view/step-one/SessionHighlights";
import StepThree from "../../view/step-three/StepThree";
import DomesticSkillTraining from "../../view/step-two/DomesticSkillTraining";
import Leisure from "../../view/step-two/Leisure";
import MealTime from "../../view/step-two/MealTime";
import PersonalCare from "../../view/step-two/PersonalCare";
import PersonalWork from "../../view/step-two/PersonalWork";
import SensoryNeeds from "../../view/step-two/SensoryNeeds";
import Socialization from "../../view/step-two/Socialization";
import SurvivalSkills from "../../view/step-two/SurvivalSkills";
import UtilizationOfMoney from "../../view/step-two/UtilizationOfMoney";

const handleDisplayForm = (
  currentIndex: number,
  handleNewCompletedSection: (newSection: number) => void,
  handleChangeIndex: (newIndex: number) => void,
  currentStep: number,
  username: string,
  handleChangeStep: (d: number) => void,
  admin?: boolean
) => {
  if (currentStep === 1) {
    switch (currentIndex) {
      case 1:
        return (
          <SessionHighlights
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            username={username}
            admin={admin}
          />
        );
      case 2:
        return (
          <ConcernsAndChallenges
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            admin={admin}
          />
        );
      case 3:
        return (
          <SelfManagement
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            username={username}
            handleChangeStep={handleChangeStep}
            admin={admin}
          />
        );
      case 4:
        return (
          <BehaviourManagement
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            admin={admin}
          />
        );
      case 5:
        return (
          <Communication
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            username={username}
            handleChangeStep={handleChangeStep}
            admin={admin}
          />
        );
      default:
        return null;
    }
  } else if (currentStep === 2) {
    switch (currentIndex) {
      case 1:
        return (
          <MealTime
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            username={username}
            admin={admin}
          />
        );
      case 2:
        return (
          <DomesticSkillTraining
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            username={username}
            admin={admin}
          />
        );
      case 3:
        return (
          <Leisure
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            username={username}
            admin={admin}
          />
        );
      case 4:
        return (
          <PersonalWork
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            username={username}
            admin={admin}
          />
        );
      case 5:
        return (
          <PersonalCare
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            username={username}
            admin={admin}
          />
        );
      case 6:
        return (
          <SensoryNeeds
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            username={username}
            admin={admin}
          />
        );
      case 7:
        return (
          <Socialization
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            username={username}
            admin={admin}
          />
        );
      case 8:
        return (
          <SurvivalSkills
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            username={username}
            admin={admin}
          />
        );
      case 9:
        return (
          <UtilizationOfMoney
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            username={username}
            handleChangeStep={handleChangeStep}
            admin={admin}
          />
        );
      default:
        return null;
    }
  } else if (currentStep === 3) {
    return (
      <StepThree
        handleNewCompletedSection={handleNewCompletedSection}
        currentIndex={currentIndex}
        handleChangeIndex={handleChangeIndex}
        handleChangeStep={handleChangeStep}
        username={username}
        admin={admin}
      />
    );
  } else {
    return null;
  }
};

export { handleDisplayForm };
