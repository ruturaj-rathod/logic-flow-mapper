# Logic Flow Mapper


## Code Setup

- Install the dependencies using `npm install`
- Then run it using `npm run dev`

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS - for UI
- React Flow - to render the tree on canvas
- Zustand - to manage state and persist it in local storage, so on refresh we get back to where we left off

## Choice of Data Structure

I used a normalized (flat) data structure instead of nesting nodes. Because we support infinite nesting, it is hard to track nodes and detect cycles with a nested structure. Having two arrays — one for nodes and one for edges — lets us easily build a graph from them. So instead of a nested data structure using a map or object, I prefer an array of nodes and an array of edges. When we call the cycle detection function, we convert them into a graph and detect the cycle easily.

## Node Deletion Behavior

Case 1: If there is a cycle, removing a node simply deletes it without connecting its parent to its child.
Case 2: If there is no cycle, removing a node connects its parent directly to its child.

