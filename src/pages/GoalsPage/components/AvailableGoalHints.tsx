import MyGoal from "@components/GoalsComponents/MyGoal/MyGoal";
import ActionDiv from "@components/GoalsComponents/MyGoalActions/ActionDiv";
import { unarchiveIcon } from "@src/assets";
import ZAccordion from "@src/common/Accordion";
import ZModal from "@src/common/ZModal";
import { darkModeState, lastAction } from "@src/store";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import plingSound from "@assets/pling.mp3";
import { GoalItem } from "@src/models/GoalItem";
import { useAvailableGoalHintContext } from "@src/contexts/availableGoalHint-context";
import { addHintGoaltoMyGoals } from "@src/api/GoalsAPI";
import { deleteAvailableGoalHint } from "@src/api/HintsAPI";

const Actions = ({ goal }: { goal: GoalItem }) => {
  const { t } = useTranslation();
  const restoreGoalSound = new Audio(plingSound);
  const setLastAction = useSetRecoilState(lastAction);
  const darkMode = useRecoilValue(darkModeState);

  return (
    <ZModal open width={400} type="interactables-modal">
      <div style={{ textAlign: "left" }} className="header-title">
        <p className="ordinary-element" id="title-field">
          {t(`${goal.title}`)}
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <button
          type="button"
          className="goal-action-archive shareOptions-btn"
          onClick={async (e) => {
            e.stopPropagation();
            await deleteAvailableGoalHint(goal.parentGoalId, goal.id);
            setLastAction("goalHintDeleted");
            restoreGoalSound.play();
            window.history.back();
          }}
        >
          <ActionDiv label={t("Delete")} icon="Delete" />
        </button>

        <button
          type="button"
          className="goal-action-archive shareOptions-btn"
          onClick={async () => {
            await addHintGoaltoMyGoals(goal);
            setLastAction("goalHintAdded");
            window.history.back();
          }}
        >
          <ActionDiv label={t("Add")} icon="Add" />
        </button>
        <button
          type="button"
          className="goal-action-archive shareOptions-btn"
          //   onClick={async () => {
          //     window.history.back();
          //   }}
        >
          <ActionDiv
            label={t("Report")}
            icon={
              <img
                alt="archived goal"
                src={unarchiveIcon}
                width={24}
                height={25}
                style={{ filter: darkMode ? "invert(1)" : "none" }}
              />
            }
          />
        </button>
      </div>
    </ZModal>
  );
};

const AvailableGoalHints = ({ goals }: { goals: GoalItem[] }) => {
  const darkMode = useRecoilValue(darkModeState);
  const [searchParams] = useSearchParams();
  const { goal: goalHint } = useAvailableGoalHintContext();
  const showOptions = !!searchParams.get("showOptions") && goalHint;

  return (
    <div className="archived-drawer">
      {showOptions && <Actions goal={goalHint} />}
      {goals.length > 0 && (
        <ZAccordion
          showCount
          style={{
            border: "none",
            background: darkMode ? "var(--secondary-background)" : "transparent",
          }}
          panels={[
            {
              header: "Hints",
              body: goals.map((goal) => <MyGoal key={`goal-${goal.id}`} goal={{ ...goal, impossible: false }} />),
            },
          ]}
        />
      )}
    </div>
  );
};

export default AvailableGoalHints;
