import inputs from './inputs.js';
import tgApi from './telegram.js';

const {
    status,
    botToken,
    chatId,
    containerName,
    containerLink,
    messageTag,
    failOnStatus,
    skipIsFail,
    cancelIsFail,
    defaultBranch,
} = inputs;

const {
    GITHUB_REPOSITORY,
    GITHUB_SHA,
    GIT_BRANCH,
} = process.env;

const gitHash = GITHUB_SHA.slice(0, 7);
const gitBranch = GIT_BRANCH.slice(11);
const isOnDefaultBranch = defaultBranch ? gitBranch === defaultBranch : (gitBranch === 'master' || gitBranch === 'main');

const successText = `
Successfully built <a href="https://github.com/${GITHUB_REPOSITORY}/commit/${gitHash}">${GITHUB_REPOSITORY}@${gitHash}</a> and pushed as <a href="${containerLink}">${containerName}</a>
#${messageTag}`;

const failText = `
<b>${isOnDefaultBranch ? 'CRITICAL ERROR' : 'Warning'}</b>
Failed to build <a href="https://github.com/${GITHUB_REPOSITORY}/commit/${gitHash}">${GITHUB_REPOSITORY}@${gitHash}</a>.
This appeared on <code>${gitBranch}</code> branch. Please, resolve issues and run this action again
#${messageTag}`;

let isFailed = false;

switch(status){
    case 'skipped':
        if(skipIsFail === 'true') isFailed = true;
        break;
    case 'cancelled':
        if(cancelIsFail === 'true') isFailed = true;
        break;
    case 'failure':
        isFailed = true;
}

await tgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    parse_mode: 'HTML',
    text: isFailed ? failText : successText,
});

if(isFailed && failOnStatus === 'true'){
    console.log('::error::status of previous action is ' + status);
    process.exit(1);
}
