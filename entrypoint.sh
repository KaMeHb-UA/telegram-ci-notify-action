#!/usr/bin/env bash
STATUS="$1"
TG_BOT_TOKEN="$2"
TG_LOG_CHAT="$3"
CONTAINER_NAME="$4"
CONTAINER_LINK="$5"
MESSAGE_HASHTAG="$6"
FAIL_ON_STATUS="$7"
SKIP_IS_FAIL="$8"
CANCEL_IS_FAIL="$9"
GIT_SHA="${GITHUB_SHA::7}"
GIT_BRANCH="${GITHUB_REF#refs/heads/}"

SUCCESS_TEXT="$(cat - <<EOF
Successfully built <a href="https://github.com/$GITHUB_REPOSITORY/commit/$GIT_SHA">$GITHUB_REPOSITORY@$GIT_SHA</a> and pushed as <a href="$CONTAINER_LINK">$CONTAINER_NAME</a>

#$MESSAGE_HASHTAG
EOF
)"

get_warning_header(){
    case "$GIT_BRANCH" in
        "master" | "main" )
        echo 'CRITICAL ERROR'
        ;;

        * )
        echo WARNING
        ;;
    esac
}

FAIL_TEXT="$(cat - <<EOF
<b>$(get_warning_header)</b>
Failed to build <a href="https://github.com/$GITHUB_REPOSITORY/commit/$GIT_SHA">$GITHUB_REPOSITORY@$GIT_SHA</a>.
This appeared on <code>$GIT_BRANCH</code> branch. Please, resolve issues and run this action again

#$MESSAGE_HASHTAG
EOF
)"

send_msg(){
    curl \
        --data-urlencode "chat_id=$TG_LOG_CHAT" \
        --data-urlencode "parse_mode=HTML" \
        --data-urlencode "text=$1" \
        https://api.telegram.org/bot$TG_BOT_TOKEN/sendMessage
}

declare IS_FAILED

if [ "$STATUS" = failure ]; then
    send_msg "$FAIL_TEXT"
    IS_FAILED="true"
elif [ "$STATUS" = success ]; then
    send_msg "$SUCCESS_TEXT"
elif [ "$SKIP_IS_FAIL" = 'true' ] && [ "$STATUS" = skipped ]; then
    send_msg "$FAIL_TEXT"
    IS_FAILED="true"
elif [ "$CANCEL_IS_FAIL" = 'true' ] && [ "$STATUS" = cancelled ]; then
    send_msg "$FAIL_TEXT"
    IS_FAILED="true"
fi

if [ "$FAIL_ON_STATUS" = 'true' ] && [ "$IS_FAILED" = 'true' ]; then
    exit 1
fi
