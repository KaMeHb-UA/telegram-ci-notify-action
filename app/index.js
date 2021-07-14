const tgApi = require('./telegram.js');
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
} = require('./inputs.js');

const {
    GITHUB_REPOSITORY,
    GITHUB_SHA,
    GITHUB_REF,
} = process.env;

const gitHash = GITHUB_SHA.slice(0, 7);
const gitBranch = GITHUB_REF.slice(11);
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

(async () => {
    const text = isFailed ? failText : successText;
    console.log('Sending message to ' + chatId + ' with text:\n' + text);
    try{
        await tgApi(botToken, 'sendMessage', {
            chat_id: chatId,
            parse_mode: 'HTML',
            text,
        });
    } catch(e){
        console.log('::error::' + e.message);
        process.exit(1);
    }

    if(isFailed && failOnStatus === 'true'){
        console.log('::error::status of previous action is ' + status);
        process.exit(1);
    }
})();
