const clientIdInput =
  document.getElementById(
    "clientId"
  );

const connectButton =
  document.getElementById(
    "connectFacebook"
  );

const reconnectButton =
  document.getElementById(
    "reconnectFacebook"
  );

const connectMessage =
  document.getElementById(
    "connectMessage"
  );

const pagesMessage =
  document.getElementById(
    "pagesMessage"
  );

const connectSection =
  document.getElementById(
    "connect-section"
  );

const pagesSection =
  document.getElementById(
    "pages-section"
  );

const pagesList =
  document.getElementById(
    "pagesList"
  );

const refreshButton =
  document.getElementById(
    "refreshPages"
  );


/* =========================================================
   STORAGE KEY
   ========================================================= */

const CLIENT_STORAGE_KEY =
  "auctomation_client_id";


/* =========================================================
   READ QUERY PARAMETER
   ========================================================= */

function getQueryParameter(
  name
) {

  const params =
    new URLSearchParams(
      window.location.search
    );

  return params.get(
    name
  );

}


/* =========================================================
   GET CLIENT ID
   ========================================================= */

function getClientId() {

  const queryClientId =
    getQueryParameter(
      "client_id"
    );


  if (
    queryClientId
  ) {

    localStorage.setItem(
      CLIENT_STORAGE_KEY,
      queryClientId
    );

    return queryClientId;

  }


  const storedClientId =
    localStorage.getItem(
      CLIENT_STORAGE_KEY
    );


  if (
    storedClientId
  ) {

    return storedClientId;

  }


  const inputValue =
    clientIdInput
      ? clientIdInput.value.trim()
      : "";


  if (
    inputValue
  ) {

    localStorage.setItem(
      CLIENT_STORAGE_KEY,
      inputValue
    );

    return inputValue;

  }


  return null;

}


/* =========================================================
   RESTORE CLIENT ID
   ========================================================= */

function restoreClientId() {

  const queryClientId =
    getQueryParameter(
      "client_id"
    );


  const storedClientId =
    localStorage.getItem(
      CLIENT_STORAGE_KEY
    );


  const clientId =
    queryClientId ||
    storedClientId;


  if (
    clientId &&
    clientIdInput
  ) {

    localStorage.setItem(
      CLIENT_STORAGE_KEY,
      clientId
    );


    clientIdInput.value =
      clientId;

  }

}


/* =========================================================
   SHOW CONNECT SCREEN
   ========================================================= */

function showConnectScreen() {

  if (
    connectSection
  ) {

    connectSection.classList.remove(
      "hidden"
    );

  }


  if (
    pagesSection
  ) {

    pagesSection.classList.add(
      "hidden"
    );

  }

}


/* =========================================================
   SHOW PAGES SCREEN
   ========================================================= */

function showPagesScreen() {

  if (
    connectSection
  ) {

    connectSection.classList.add(
      "hidden"
    );

  }


  if (
    pagesSection
  ) {

    pagesSection.classList.remove(
      "hidden"
    );

  }

}


/* =========================================================
   BUILD FACEBOOK OAUTH URL
   ========================================================= */

function buildFacebookOAuthUrl(
  clientId
) {

  if (
    !CONFIG ||
    !CONFIG.FACEBOOK_OAUTH_START
  ) {

    throw new Error(
      "FACEBOOK_OAUTH_START is not configured."
    );

  }


  const url =
    new URL(
      CONFIG.FACEBOOK_OAUTH_START
    );


  url.searchParams.set(
    "client_id",
    clientId
  );


  url.searchParams.set(
    "return_url",
    window.location.origin +
    window.location.pathname
  );


  return url.toString();

}


/* =========================================================
   CONNECT FACEBOOK
   ========================================================= */

function connectFacebook() {

  const inputClientId =
    clientIdInput
      ? clientIdInput.value.trim()
      : "";


  if (
    !inputClientId
  ) {

    if (
      connectMessage
    ) {

      connectMessage.textContent =
        "Please enter your Client ID.";

    }


    return;

  }


  localStorage.setItem(
    CLIENT_STORAGE_KEY,
    inputClientId
  );


  if (
    connectButton
  ) {

    connectButton.disabled =
      true;

  }


  if (
    connectMessage
  ) {

    connectMessage.textContent =
      "Redirecting to Facebook...";

  }


  try {

    const oauthUrl =
      buildFacebookOAuthUrl(
        inputClientId
      );


    console.log(
      "Connecting Facebook:",
      oauthUrl
    );


    window.location.assign(
      oauthUrl
    );

  }

  catch (
    error
  ) {

    console.error(
      "Connect Facebook error:",
      error
    );


    if (
      connectButton
    ) {

      connectButton.disabled =
        false;

    }


    if (
      connectMessage
    ) {

      connectMessage.textContent =
        error instanceof Error
          ? error.message
          : String(
              error
            );

    }

  }

}


/* =========================================================
   RECONNECT FACEBOOK
   ========================================================= */

function reconnectFacebook() {

  console.log(
    "Reconnect Facebook clicked"
  );


  const clientId =
    getClientId();


  console.log(
    "Reconnect client ID:",
    clientId
  );


  if (
    !clientId
  ) {

    if (
      pagesMessage
    ) {

      pagesMessage.textContent =
        "Client ID is missing. Please reconnect from the main screen.";

    }


    showConnectScreen();

    return;

  }


  if (
    reconnectButton
  ) {

    reconnectButton.disabled =
      true;

  }


  if (
    refreshButton
  ) {

    refreshButton.disabled =
      true;

  }


  if (
    pagesMessage
  ) {

    pagesMessage.textContent =
      "Redirecting to Facebook to refresh your Page connection...";

  }


  localStorage.setItem(
    CLIENT_STORAGE_KEY,
    clientId
  );


  try {

    const oauthUrl =
      buildFacebookOAuthUrl(
        clientId
      );


    console.log(
      "Reconnect OAuth URL:",
      oauthUrl
    );


    window.location.assign(
      oauthUrl
    );

  }

  catch (
    error
  ) {

    console.error(
      "Reconnect Facebook error:",
      error
    );


    if (
      reconnectButton
    ) {

      reconnectButton.disabled =
        false;

    }


    if (
      refreshButton
    ) {

      refreshButton.disabled =
        false;

    }


    if (
      pagesMessage
    ) {

      pagesMessage.textContent =
        error instanceof Error
          ? error.message
          : String(
              error
            );

    }

  }

}


/* =========================================================
   LOAD CONNECTED PAGES
   ========================================================= */

async function loadPages() {

  const clientId =
    getClientId();


  if (
    !clientId
  ) {

    showConnectScreen();

    return;

  }


  if (
    clientIdInput
  ) {

    clientIdInput.value =
      clientId;

  }


  if (
    pagesList
  ) {

    pagesList.innerHTML =
      `
        <div class="empty-message">
          Loading connected Pages...
        </div>
      `;

  }


  if (
    pagesMessage
  ) {

    pagesMessage.textContent =
      "";

  }


  if (
    refreshButton
  ) {

    refreshButton.disabled =
      true;

  }


  if (
    reconnectButton
  ) {

    reconnectButton.disabled =
      true;

  }


  try {

    if (
      !CONFIG ||
      !CONFIG.CLIENT_PAGES_ENDPOINT
    ) {

      throw new Error(
        "CLIENT_PAGES_ENDPOINT is not configured."
      );

    }


    const url =
      new URL(
        CONFIG.CLIENT_PAGES_ENDPOINT
      );


    url.searchParams.set(
      "client_id",
      clientId
    );


    console.log(
      "Loading connected Pages:",
      url.toString()
    );


    const response =
      await fetch(
        url.toString(),
        {
          method:
            "GET",

          headers: {
            Accept:
              "application/json"
          },

          cache:
            "no-store"
        }
      );


    const responseText =
      await response.text();


    let result;


    try {

      result =
        JSON.parse(
          responseText
        );

    }

    catch {

      throw new Error(
        `client-pages returned an invalid response: ${responseText}`
      );

    }


    console.log(
      "client-pages result:",
      result
    );


    if (
      !response.ok ||
      result.success === false
    ) {

      throw new Error(
        result.message ||
        result.error ||
        "Unable to load connected Pages."
      );

    }


    const pages =
      Array.isArray(
        result.pages
      )
        ? result.pages
        : [];


    /* -----------------------------------------------------
       NO CONNECTED PAGE
       ----------------------------------------------------- */

    if (
      pages.length === 0
    ) {

      showConnectScreen();


      if (
        connectMessage
      ) {

        connectMessage.textContent =
          "No Facebook Pages are connected to this client yet.";

      }


      return;

    }


    /* -----------------------------------------------------
       CONNECTED
       ----------------------------------------------------- */

    showPagesScreen();


    if (
      pagesList
    ) {

      pagesList.innerHTML =
        "";

    }


    for (
      const page of pages
    ) {

      const element =
        document.createElement(
          "div"
        );


      element.className =
        "page-item";


      const status =
        page.connection_status ||
        page.status ||
        "CONNECTED";


      element.innerHTML =
        `
          <div>

            <div class="page-name">
              ${escapeHtml(
                page.page_nm ||
                "Facebook Page"
              )}
            </div>

            <div class="page-id">
              Page ID:
              ${escapeHtml(
                page.fb_page_id ||
                ""
              )}
            </div>

          </div>

          <div class="page-status">
            ${escapeHtml(
              status
            )}
          </div>
        `;


      if (
        pagesList
      ) {

        pagesList.appendChild(
          element
        );

      }

    }


    const oauthSuccess =
      getQueryParameter(
        "facebook_connected"
      );


    if (
      oauthSuccess ===
        "true" &&
      pagesMessage
    ) {

      pagesMessage.textContent =
        "Facebook connection refreshed successfully.";

    }


    cleanOAuthParameters();

  }

  catch (
    error
  ) {

    console.error(
      "Unable to load connected Pages:",
      error
    );


    showConnectScreen();


    if (
      connectMessage
    ) {

      connectMessage.textContent =
        error instanceof Error
          ? error.message
          : String(
              error
            );

    }

  }

  finally {

    if (
      refreshButton
    ) {

      refreshButton.disabled =
        false;

    }


    if (
      reconnectButton
    ) {

      reconnectButton.disabled =
        false;

    }

  }

}


/* =========================================================
   CLEAN OAUTH PARAMETERS
   ========================================================= */

function cleanOAuthParameters() {

  const url =
    new URL(
      window.location.href
    );


  url.searchParams.delete(
    "facebook_connected"
  );


  url.searchParams.delete(
    "pages_connected"
  );


  url.searchParams.delete(
    "client_id"
  );


  const cleanUrl =
    url.pathname +
    (
      url.search
        ? url.search
        : ""
    ) +
    (
      url.hash
        ? url.hash
        : ""
    );


  window.history.replaceState(
    {},
    document.title,
    cleanUrl
  );

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

if (
  connectButton
) {

  connectButton.addEventListener(
    "click",
    connectFacebook
  );

}


if (
  reconnectButton
) {

  reconnectButton.addEventListener(
    "click",
    reconnectFacebook
  );

}


if (
  refreshButton
) {

  refreshButton.addEventListener(
    "click",
    loadPages
  );

}


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initialize() {

  console.log(
    "Auctomation frontend initialized"
  );


  restoreClientId();


  const oauthSuccess =
    getQueryParameter(
      "facebook_connected"
    );


  const clientId =
    getClientId();


  console.log(
    "Initial client ID:",
    clientId
  );


  if (
    oauthSuccess ===
      "true" &&
    clientId
  ) {

    showPagesScreen();


    if (
      pagesList
    ) {

      pagesList.innerHTML =
        `
          <div class="empty-message">
            Facebook connected successfully.
            Loading your Page...
          </div>
        `;

    }

  }


  else if (
    clientId
  ) {

    showPagesScreen();


    if (
      pagesList
    ) {

      pagesList.innerHTML =
        `
          <div class="empty-message">
            Loading connected Pages...
          </div>
        `;

    }

  }


  else {

    showConnectScreen();

  }


  await loadPages();

}


/* =========================================================
   START
   ========================================================= */

initialize();
