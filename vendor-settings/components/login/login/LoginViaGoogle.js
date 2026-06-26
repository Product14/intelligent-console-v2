import React from 'react'

function LoginViaGoogle() {
    return (
        <>
            <div id="g_id_onload"
                data-client_id="887824920844-6n7pic33ra30hf0mjlrc8f1m6qt6hs9r.apps.googleusercontent.com"
                data-context="signin"
                data-ux_mode="popup"
                data-login_uri="http://localhost:3000/login"
                data-auto_select='true'
                data-itp_support="true"
                // data-callback='handleCredentialResponse'
            >
            </div>

            <div className="g_id_signin"
                data-type="standard"
                data-shape="pill"
                data-theme="outline"
                data-text="signin_with"
                data-size="large"
                data-logo_alignment="center">
            </div>
        </>
    )
}

export default LoginViaGoogle