import { createFrames } from 'frames.js/next';

export const frames = createFrames<State>({
    basePath: "/frames",
    initialState: {
        page: 'undefined',
        revealed: false,
        started: false,
    }
});

export type State = {
    page: string;
    revealed: boolean;
    started: boolean;
}