import "dreamland";
import { Route, Router } from "dreamland-router";
import Home from "./routes/home";
import Privacy from "./routes/privacy";
import Terms from "./routes/terms";
import Error from "./routes/error";
import Games from "./routes/games";
import "./index.css";

new Router(
    (
        <Route>
            <Route path="/" show={<Home />} />
            <Route path="/privacy" show={<Privacy />} />
            <Route path="/terms" show={<Terms />} />
            <Route path="/games" show={<Games />} />
            <Route path="*" show={<Error />} />
        </Route>
    ),
).mount(document.getElementById("app"));
