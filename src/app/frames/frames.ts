import { createFrames } from 'frames.js/next';

export const frames = createFrames<State>({
    basePath: "/frames",
    initialState: {
        page: 'undefined'
    }
});

export type State = {
    page: string;
}