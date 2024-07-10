/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, ChangeEvent } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import ZinZenTextLight from "@assets/images/LogoTextLight.svg";
import ZinZenTextDark from "@assets/images/LogoTextDark.svg";

import { displayChangesModal, displayShareModal } from "@src/store/GoalsState";
import { GoalItem, TGoalCategory } from "@src/models/GoalItem";
import { GoalSublist } from "@components/GoalsComponents/GoalSublist/GoalSublist";
import { getActiveGoals } from "@api/GoalsAPI";
import { createGoalObjectFromTags } from "@src/helpers/GoalProcessor";
import { darkModeState, lastAction, searchActive } from "@src/store";

import AppLayout from "@src/layouts/AppLayout";
import GoalsList from "@components/GoalsComponents/GoalsList";
import ConfigGoal from "@components/GoalsComponents/GoalConfigModal/ConfigGoal";
import ShareGoalModal from "@components/GoalsComponents/ShareGoalModal/ShareGoalModal";
import GoalsAccordion from "@components/GoalsComponents/GoalsAccordion";
import DisplayChangesModal from "@components/GoalsComponents/DisplayChangesModal/DisplayChangesModal";
import { TrashItem } from "@src/models/TrashItem";
import { getDeletedGoals } from "@src/api/TrashAPI";
import { priotizeImpossibleGoals } from "@src/utils/priotizeImpossibleGoals";

import { useParams, useSearchParams } from "react-router-dom";
import { ParentGoalProvider } from "@src/contexts/parentGoal-context";
import { useActiveGoalContext } from "@src/contexts/activeGoal-context";
import RegularGoalActions from "@components/GoalsComponents/MyGoalActions/RegularGoalActions";
import { goalCategories } from "@src/constants/myGoals";
import { TGoalConfigMode } from "@src/types";

export const MyGoals = () => {
  let debounceTimeout: ReturnType<typeof setTimeout>;
  const [activeGoals, setActiveGoals] = useState<GoalItem[]>([]);
  const [archivedGoals, setArchivedGoals] = useState<GoalItem[]>([]);
  const [deletedGoals, setDeletedGoals] = useState<GoalItem[]>([]);
  // const [showActions, setShowActions] = useState({ open: "root", click: 1 });

  const { parentId = "root" } = useParams();

  const [searchParams] = useSearchParams();
  const showOptions = !!searchParams.get("showOptions");
  const goalType = (searchParams.get("type") as TGoalCategory) || "";

  const mode = (searchParams.get("mode") as TGoalConfigMode) || "";

  const { goal: activeGoal } = useActiveGoalContext();
  console.log("🚀 ~ MyGoals ~ activeGoal:", activeGoal);

  const displaySearch = useRecoilValue(searchActive);
  const darkModeStatus = useRecoilValue(darkModeState);
  const showShareModal = useRecoilValue(displayShareModal);
  const showChangesModal = useRecoilValue(displayChangesModal);

  const [action, setLastAction] = useRecoilState(lastAction);

  const getAllGoals = async () => {
    const [goals, delGoals] = await Promise.all([getActiveGoals("true"), getDeletedGoals("root")]);
    return { goals, delGoals };
  };
  const handleUserGoals = (goals: GoalItem[], delGoals: TrashItem[]) => {
    setDeletedGoals([...delGoals.map(({ deletedAt, ...goal }) => goal)]);
    setActiveGoals([...goals.filter((goal) => goal.archived === "false")]);
    setArchivedGoals([...goals.filter((goal) => goal.archived === "true" && goal.typeOfGoal === "myGoal")]);
  };
  const refreshActiveGoals = async () => {
    const { goals, delGoals } = await getAllGoals();
    const sortedGoals = await priotizeImpossibleGoals(goals);
    handleUserGoals(sortedGoals, delGoals);
  };
  const search = async (text: string) => {
    const { goals, delGoals } = await getAllGoals();
    handleUserGoals(
      goals.filter((goal) => goal.title.toUpperCase().includes(text.toUpperCase())),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      delGoals.filter(({ deletedAt, ...goal }) => goal.title.toUpperCase().includes(text.toUpperCase())),
    );
  };
  const debounceSearch = (event: ChangeEvent<HTMLInputElement>) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(() => {
      search(event.target.value);
    }, 300);
  };

  const zinZenLogoHeight = activeGoals.length > 0 ? 125 : 350;

  useEffect(() => {
    if (action !== "none") {
      setLastAction("none");
      refreshActiveGoals();
    }
  }, [action]);

  // useEffect(() => {
  //   refreshActiveGoals();
  // }, [showShareModal, showAddGoal, showChangesModal, showUpdateGoal, showSuggestionModal, showChangesModal]);

  useEffect(() => {
    if (parentId === "root") {
      refreshActiveGoals();
    }
  }, [parentId, displaySearch]);

  return (
    <AppLayout title="myGoals" debounceSearch={debounceSearch}>
      <ParentGoalProvider>
        {showShareModal && <ShareGoalModal goal={showShareModal} />}
        {showChangesModal && <DisplayChangesModal />}
        {showOptions && activeGoal && <RegularGoalActions goal={activeGoal} />}
        {goalCategories.includes(goalType) && (
          <ConfigGoal type={goalType} goal={activeGoal || createGoalObjectFromTags()} mode={mode} />
        )}

        <div className="myGoals-container">
          {parentId === "root" ? (
            <div className="my-goals-content">
              <div className="d-flex f-col">
                <GoalsList goals={activeGoals} setGoals={setActiveGoals} />
              </div>
              {archivedGoals.length > 0 && <GoalsAccordion header="Done" goals={archivedGoals} />}
              {deletedGoals.length > 0 && <GoalsAccordion header="Trash" goals={deletedGoals} />}
            </div>
          ) : (
            <GoalSublist />
          )}

          <img
            style={{ width: 180, height: zinZenLogoHeight, opacity: 0.3 }}
            src={darkModeStatus ? ZinZenTextDark : ZinZenTextLight}
            alt="Zinzen"
          />
        </div>
      </ParentGoalProvider>
    </AppLayout>
  );
};
