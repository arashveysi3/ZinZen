import { test, expect, Page } from "@playwright/test";
import { shareGoalPrivately } from "./lib/testUtils";

const apiServerUrl = "https://sfk3sq5mfzgfjfy3hytp4tmon40bbjpu.lambda-url.eu-west-1.on.aws/";
const apiServerUrlGoal = "https://x7phxjeuwd4aqpgbde6f74s4ey0yobfi.lambda-url.eu-west-1.on.aws/";

test.describe.configure({ mode: "serial" });

test.describe("Goal Sharing Feature", () => {
  let userOneContext;
  let userTwoContext;
  let userThreeContext;
  let userOnePage: Page;
  let userTwoPage: Page;
  let userThreePage: Page;
  let inviationLink: string;

  let userOnePageGoalTitle: string;

  test.beforeAll(async ({ browser }) => {
    userOneContext = await browser.newContext({
      storageState: "playwright/userOnboarding.json",
    });
    userTwoContext = await browser.newContext({
      storageState: "playwright/userOnboarding.json",
    });
    userThreeContext = await browser.newContext({
      storageState: "playwright/userOnboarding.json",
    });

    userTwoPage = await userTwoContext.newPage();
    userOnePage = await userOneContext.newPage();
    userThreePage = await userThreeContext.newPage();
  });

  test("add contact in user 1", async () => {
    await userOnePage.goto("http://127.0.0.1:3000/");
    await userOnePage.getByRole("button", { name: "Goals" }).click();
    userOnePageGoalTitle = await userOnePage.locator(".goal-title").first().locator("span").innerText();
    await shareGoalPrivately(userOnePage);
    await userOnePage.getByPlaceholder("Name").click();
    await userOnePage.getByPlaceholder("Name").fill("User 2");
    await userOnePage.getByRole("button", { name: "add contact Share invitation" }).click();
    await Promise.all([
      userOnePage.waitForResponse(
        (res) =>
          res.status() === 200 &&
          res.url().includes(apiServerUrl) &&
          res.body().then((responseBody) => {
            return responseBody.includes("relId");
          }),
      ),
    ]);
    await userOnePage.goBack();
    await userOnePage.getByRole("button", { name: "U", exact: true }).click();
    await Promise.all([
      userOnePage.waitForResponse(
        (res) =>
          res.status() === 200 &&
          res.url().includes(apiServerUrl) &&
          res.body().then((responseBody) => {
            return responseBody.includes("relationshipId");
          }),
      ),
    ]);
    await userOnePage.waitForSelector(".ant-notification-notice");
    inviationLink = await userOnePage.evaluate("navigator.clipboard.readText()");
    await userOnePage.goto("http://127.0.0.1:3000/");
    await userOnePage.getByRole("button", { name: "Goals" }).click();
    await shareGoalPrivately(userOnePage);
  });

  test("add contact in user 2", async () => {
    await userTwoPage.goto(`${inviationLink}`);
    await userTwoPage.getByPlaceholder("Contact name").click();
    await userTwoPage.getByPlaceholder("Contact name").fill("User 1");
    await userTwoPage.getByRole("button", { name: "Add to my contacts" }).click();
    await Promise.all([
      userTwoPage.waitForResponse(
        (res) =>
          res.status() === 200 &&
          res.url().includes(apiServerUrl) &&
          res.body().then((responseBody) => {
            return responseBody.includes("accepted");
          }),
      ),
    ]);
  });

  test("share goal in user 1", async () => {
    await userOnePage.getByRole("button", { name: "U", exact: true }).click();
    await userOnePage.waitForSelector(".ant-notification-notice");
  });

  test("check goal in user 2", async () => {
    await userTwoPage.reload();
    await Promise.all([
      userTwoPage.waitForResponse(
        (res) =>
          res.status() === 200 &&
          res.url().includes(apiServerUrlGoal) &&
          res.body().then((responseBody) => {
            return responseBody.includes("shareMessage");
          }),
      ),
    ]);
    await userTwoPage.getByRole("img", { name: "ZinZen" }).click();
    await userTwoPage.reload();
    await expect(userTwoPage.locator(".user-goal-main")).toBeVisible();
  });

  test("collaboration between user1 and user2", async () => {
    await userTwoPage.locator(".goal-dd-inner").first().click();
    await userTwoPage
      .locator("div")
      .filter({ hasText: /^Collaborate$/ })
      .first()
      .click();
    await userTwoPage.getByRole("button", { name: "Collaborate on goal" }).click();
  });

  test("check colloborated goal in user 2 myGoals", async () => {
    await userTwoPage.getByRole("button", { name: "Goals" }).click();
    await expect(userTwoPage.locator(".goal-title").first().locator("span")).toContainText(userOnePageGoalTitle);
    await shareGoalPrivately(userTwoPage);
    await userTwoPage.getByRole("button", { name: "add contact", exact: true }).click();
    await userTwoPage.getByPlaceholder("Name").click();
    await userTwoPage.getByPlaceholder("Name").fill("User 3");
    await userTwoPage.getByRole("button", { name: "add contact Share invitation" }).click();
    await Promise.all([
      userTwoPage.waitForResponse(
        (res) =>
          res.status() === 200 &&
          res.url().includes(apiServerUrl) &&
          res.body().then((responseBody) => {
            return responseBody.includes("relId");
          }),
      ),
    ]);
    await userTwoPage.goBack();
    await userTwoPage
      .locator("div")
      .filter({ hasText: /^UUser 3$/ })
      .getByRole("button")
      .click();
    await Promise.all([
      userTwoPage.waitForResponse(
        (res) =>
          res.status() === 200 &&
          res.url().includes(apiServerUrl) &&
          res.body().then((responseBody) => {
            return responseBody.includes("relationshipId");
          }),
      ),
    ]);
    await userTwoPage.waitForSelector(".ant-notification-notice");
    inviationLink = await userTwoPage.evaluate("navigator.clipboard.readText()");
    await userTwoPage.goto("http://127.0.0.1:3000/");
    await userTwoPage.getByRole("button", { name: "Goals" }).click();
    await shareGoalPrivately(userTwoPage);
  });

  test("add contact in user 3", async () => {
    await userThreePage.goto(`${inviationLink}`);
    await userThreePage.getByPlaceholder("Contact name").click();
    await userThreePage.getByPlaceholder("Contact name").fill("User 3");
    await userThreePage.getByRole("button", { name: "Add to my contacts" }).click();
    await Promise.all([
      userThreePage.waitForResponse(
        (res) =>
          res.status() === 200 &&
          res.url().includes(apiServerUrl) &&
          res.body().then((responseBody) => {
            return responseBody.includes("accepted");
          }),
      ),
    ]);
  });

  test("share goal in user 2", async () => {
    await userTwoPage
      .locator("div")
      .filter({ hasText: /^UUser 3$/ })
      .getByRole("button")
      .click();
    await userTwoPage.waitForSelector(".ant-notification-notice");
  });

  test("check goal in user 3", async () => {
    await userThreePage.reload();
    await Promise.all([
      userThreePage.waitForResponse(
        (res) =>
          res.status() === 200 &&
          res.url().includes(apiServerUrlGoal) &&
          res.body().then((responseBody) => {
            return responseBody.includes("shareMessage");
          }),
      ),
    ]);
    await userThreePage.getByRole("img", { name: "ZinZen" }).click();
    await userThreePage.reload();
    await expect(userThreePage.locator(".user-goal-main")).toBeVisible();
  });

  test("collaboration between user2 and user3", async () => {
    await userThreePage.locator(".goal-dd-inner").first().click();
    await userThreePage
      .locator("div")
      .filter({ hasText: /^Collaborate$/ })
      .first()
      .click();
    await userThreePage.getByRole("button", { name: "Collaborate on goal" }).click();

    await userThreePage.getByRole("button", { name: "Goals" }).click();
    await expect(userThreePage.locator(".goal-title").first().locator("span")).toContainText(userOnePageGoalTitle);
  });

  test("edit goal in user 1 and check changes in user 2", async () => {
    await userOnePage.goto("http://127.0.0.1:3000/");
    await userOnePage.getByRole("button", { name: "Goals" }).click();
    await userOnePage.locator(".goal-dd-outer").first().click();
    await userOnePage
      .locator("div")
      .filter({ hasText: /^Edit$/ })
      .first()
      .click();
    await userOnePage.locator(".header-title").locator("input").fill(`${userOnePageGoalTitle} edited by user 1`);
    await userOnePage.locator(".action-btn-container").locator(".action-btn").click();
    userOnePageGoalTitle = await userOnePage.locator(".goal-title").first().locator("span").innerText();

    await userTwoPage.goto("http://127.0.0.1:3000/");
    await userTwoPage.getByRole("button", { name: "Goals" }).click();
    await userTwoPage.getByRole("button", { name: "Schedule" }).click();
    await userTwoPage.getByRole("button", { name: "Goals" }).click();
    await userTwoPage.reload();
    await Promise.all([
      userTwoPage.waitForResponse((res) => res.status() === 200 && res.url().includes(apiServerUrlGoal)),
    ]);
  });
});
