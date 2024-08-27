import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { darkModeState } from "@src/store";
import { ILocationState, ImpossibleGoal } from "@src/Interfaces";
import { extractLinks } from "@src/utils/patterns";
import { useParentGoalContext } from "@src/contexts/parentGoal-context";
import GoalAvatar from "../GoalAvatar";
import GoalTitle from "./components/GoalTitle";
import GoalDropdown from "./components/GoalDropdown";

interface MyGoalProps {
  goal: ImpossibleGoal;
  dragAttributes?: any;
  dragListeners?: any;
}

const MyGoal: React.FC<MyGoalProps> = ({ goal, dragAttributes, dragListeners }) => {
  const { partnerId } = useParams();
  const isPartnerModeActive = !!partnerId;

  const [expandGoalId, setExpandGoalId] = useState("root");
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const {
    parentData: { parentGoal },
  } = useParentGoalContext();
  const darkModeStatus = useRecoilValue(darkModeState);

  const redirect = (state: object, isDropdown = false) => {
    const prefix = `${isPartnerModeActive ? `/partners/${partnerId}/` : "/"}goals`;
    if (isDropdown) {
      const searchparam = goal.newUpdates ? "showNewChanges" : "showOptions";
      navigate(`${prefix}/${parentGoal?.id || "root"}/${goal.id}?${searchparam}=true`, { state });
    } else {
      navigate(`${prefix}/${goal.id}`, { state });
    }
  };

  const handleGoalClick = () => {
    const url = extractLinks(goal.title);
    if (url) {
      const finalUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
      window.open(finalUrl, "_blank");
    }
    const newState: ILocationState = {
      ...location.state,
      activeGoalId: goal.id,
      goalsHistory: [
        ...(location.state?.goalsHistory || []),
        {
          goalID: goal.id || "root",
          goalColor: goal.goalColor || "#ffffff",
          goalTitle: goal.title || "",
        },
      ],
    };
    redirect(newState);
  };

  useEffect(() => {
    if (location && location.pathname === "/goals") {
      const { expandedGoalId } = location.state || {};
      setExpandGoalId(expandedGoalId);
    }
  }, [location]);

  return (
    <div
      id={`goal-${goal.id}`}
      key={String(`goal-${goal.id}`)}
      className={`user-goal${darkModeStatus ? "-dark" : ""} ${
        expandGoalId === goal.id && isAnimating ? "goal-glow" : ""
      }`}
    >
      <div
        className="user-goal-main"
        style={{
          ...(goal.typeOfGoal !== "myGoal" && goal.parentGoalId === "root" ? { width: "80%" } : {}),
        }}
      >
        <GoalDropdown
          goal={goal}
          onClick={() => redirect(location.state, true)}
          dragAttributes={dragAttributes}
          dragListeners={dragListeners}
        />
        <div aria-hidden className="goal-tile">
          <GoalTitle goal={goal} isImpossible={goal.impossible} onClick={handleGoalClick} />
        </div>
      </div>
      {!isPartnerModeActive && goal.participants?.length > 0 && <GoalAvatar goal={goal} />}
    </div>
  );
};

export default MyGoal;
