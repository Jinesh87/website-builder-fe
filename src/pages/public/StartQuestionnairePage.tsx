import QuestionnaireForm from "../../features/questionnaire/QuestionnaireForm.tsx";

export default function StartQuestionnairePage() {
  return (
    <div className="py-6 sm:py-8 bg-canvas">
      <QuestionnaireForm brandName="Bytezora" theme="light" standalone={false} />
    </div>
  );
}
