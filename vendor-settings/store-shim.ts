// Shim for the shared @spyne-console/store package. The onboarding screens only
// use the react-redux hooks from it; thunks/actions used by other (unused) vendored
// components aren't needed in the active graph.
export { useSelector, useDispatch, useStore } from 'react-redux';
