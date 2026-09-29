import { Component } from 'react';

/** Shows a friendly screen instead of a blank page if React ever crashes. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  componentDidCatch(error) {
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-blush px-6 text-center">
          <p className="tabular text-5xl font-bold text-ruby">Oops</p>
          <h1 className="mt-3 text-xl font-bold text-bordeaux">Something went wrong on this page.</h1>
          <p className="mt-2 max-w-md text-sm text-bordeaux/70">
            A quick refresh usually fixes it. If the problem stays, the dev server may have restarted —
            wait a second and reload.
          </p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-6">
            Reload page
          </button>
          <code className="mt-6 max-w-lg overflow-hidden text-xs text-bordeaux/50">{this.state.message}</code>
        </div>
      );
    }
    return this.props.children;
  }
}
