import React from "react";
import { Offcanvas } from "react-bootstrap";
import { useRecoilState, useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";

import { displaySidebar } from "@src/store/SidebarState";
import { darkModeState } from "@src/store";
import { useNavigate } from "react-router";
import { LandingHeader } from "./HeaderDashboard/LandingHeader";
import GoalInvites from "./GoalsComponents/GoalInvites/GoalInvites";

import "@translations/i18n";

const navButtonStyle = {
  border: "none",
  marginTop: "1.5em",
  width: "200px",
  borderRadius: "8px",
  padding: "5px 20px",
  fontWeight: "bolder",
  fontSize: "1.143em",
  color: "black",
  textAlign: "left",
  background: "transparent"
};
const darkNavBtn = {
  color: "white",
};

const Sidebar = () => {
  const navigate = useNavigate();
  const darkModeStatus = useRecoilValue(darkModeState);
  const [showSidebar, setShowSidebar] = useRecoilState(displaySidebar);

  const { t } = useTranslation();

  const getNavButton = (text: string, to = "/") => (
    <button
      type="button"
      style={{
        ...navButtonStyle,
        ...(darkModeStatus ? darkNavBtn : {}) }}
      onClick={() => {
        setShowSidebar(false);
        if (to.includes("http")) window.open(to, "_self");
        else navigate(to);
      }}
    >
      {text}
    </button>
  );

  return (

    <Offcanvas
      show={showSidebar}
      onHide={() => setShowSidebar(false)}
      className={darkModeStatus ? "App-dark" : "App-light"}
      style={{ width: "85vw" }}
    >
      <Offcanvas.Header>
        <Offcanvas.Title>
          <LandingHeader avatar={null} />
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "4vh" }}>
          { getNavButton(t("myfeelings"), "/MyFeelings") }
          <GoalInvites invitesType="sharedGoals" />
          <GoalInvites invitesType="collaboratedGoals" />
          { getNavButton(t("blog"), "https://blog.zinzen.me/") }
          { getNavButton(t("donate"), "https://donate.stripe.com/6oE4jK1iPcPT1m89AA") }
          { getNavButton(t("feedback"), "/ZinZen/Feedback") }
          { getNavButton(t("privacy"), "/ZinZenFAQ") }
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Sidebar;