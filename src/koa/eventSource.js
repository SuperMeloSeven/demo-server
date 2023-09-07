const Koa = require('koa');
const Router = require('koa-router');

const { PassThrough } = require('stream');

const app = new Koa();
const router = new Router();

router.get('/events', async (ctx) => {
    ctx.request.socket.setTimeout(0);
    ctx.req.socket.setNoDelay(true);
    ctx.req.socket.setKeepAlive(true);
    ctx.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        // 'Access-Control-Allow-Credentials': 'true'
    });

    const stream = new PassThrough();
    ctx.status = 200;
    ctx.body = stream;

    setInterval(() => {
        stream.write(`data: ${new Date()}\n\n`);
    }, 1000);
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);


console.log('Server is running at http://localhost:3000');
