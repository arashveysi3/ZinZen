import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useLocation, useParams } from "react-router-dom";

import ZModal from "@src/common/ZModal";
import useGoalStore from "@src/hooks/useGoalStore";
import ConfirmationModal from "@src/common/ConfirmationModal";

import { GoalItem } from "@src/models/GoalItem";
import { restoreGoal } from "@src/helpers/GoalController";
import { TConfirmAction } from "@src/Interfaces/IPopupModals";
import { unarchiveIcon } from "@src/assets";
import { ILocationState } from "@src/Interfaces";
import { unarchiveUserGoal } from "@src/api/GoalsAPI";
import { TAction } from "@src/store/GoalsState";
import { archiveThisGoal, removeThisGoal } from "@src/helpers/GoalActionHelper";
import { lastAction, openDevMode, displayConfirmation, darkModeState } from "@src/store";

import ActionDiv from "./ActionDiv";
import "./MyGoalActions.scss";

const AccordionActions = ({ actionType, goal, open }: { actionType: TAction; open: boolean; goal: GoalItem }) => {
  const { t } = useTranslation();
  const { state }: { state: ILocationState } = useLocation();
  const { partnerId } = useParams();
  const isPartnerModeActive = !!partnerId;
  const { openEditMode, handleConfirmation } = useGoalStore();
  const confirmActionCategory = goal.typeOfGoal === "shared" && goal.parentGoalId === "root" ? "collaboration" : "goal";

  const ancestors = (state?.goalsHistory || []).map((ele) => ele.goalID);
  const showConfirmation = useRecoilValue(displayConfirmation);
  const setDevMode = useSetRecoilState(openDevMode);
  const darkModeStatus = useRecoilValue(darkModeState);
  const setLastAction = useSetRecoilState(lastAction);

  const [confirmationAction, setConfirmationAction] = useState<TConfirmAction | null>(null);

  const handleActionClick = async (action: string) => {
    if (action === "delete") {
      if (goal.title === "magic") {
        setDevMode(false);
      }
      await removeThisGoal(goal, ancestors, isPartnerModeActive);
      setLastAction("goalDeleted");
    } else if (action === "archive") {
      await archiveThisGoal(goal, ancestors);
      setLastAction("goalArchived");
    } else if (action === "restore") {
      if (actionType === "archived") {
        await unarchiveUserGoal(goal);
      } else if (actionType === "deleted") {
        await restoreGoal(goal, ancestors);
      }
      setLastAction("goalUnarchived");
    } else {
      return;
    }
    window.history.go(confirmationAction ? -2 : -1);
  };

  const openConfirmationPopUp = async (action: TConfirmAction) => {
    const { actionCategory, actionName } = action;
    if (actionCategory === "collaboration" && showConfirmation.collaboration[actionName]) {
      handleConfirmation();
      setConfirmationAction({ ...action });
    } else if (actionCategory === "goal" && showConfirmation.goal[action.actionName]) {
      handleConfirmation();
      setConfirmationAction({ ...action });
    } else {
      await handleActionClick(actionName);
    }
  };

  return (
    <ZModal open={open} width={400} onCancel={() => window.history.back()} type="interactables-modal">
      <div
        style={{ textAlign: "left" }}
        className="header-title"
        onClickCapture={() => {
          openEditMode(goal);
        }}
      >
        <p className="ordinary-element" id="title-field">
          {t(`${goal.title}`)}
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {confirmationAction && (
          <ConfirmationModal
            action={confirmationAction}
            handleClick={handleActionClick}
            handleClose={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        )}

        <div
          className="goal-action-archive shareOptions-btn"
          onClickCapture={async (e) => {
            e.stopPropagation();
            await openConfirmationPopUp({ actionCategory: confirmActionCategory, actionName: "restore" });
          }}
        >
          <ActionDiv
            label={t("Restore")}
            icon={
              <img
                alt="archived goal"
                src={unarchiveIcon}
                style={{ width: 24, height: 25, filter: darkModeStatus ? "invert(1)" : "none" }}
              />
            }
          />
        </div>
        {!isPartnerModeActive && (
          <div
            className="goal-action-archive shareOptions-btn"
            onClickCapture={async (e) => {
              e.stopPropagation();
              await openConfirmationPopUp({ actionCategory: confirmActionCategory, actionName: "delete" });
            }}
          >
            <ActionDiv label={t("Delete")} icon="Delete" />
          </div>
        )}
      </div>
    </ZModal>
  );
};

export default AccordionActions;
