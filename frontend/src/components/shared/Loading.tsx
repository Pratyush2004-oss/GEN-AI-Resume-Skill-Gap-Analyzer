import './loading.scss';

const Loading = () => {
    return (
        <div className="loading-screen" role="status" aria-label="Loading">
            <img src="/logo.svg" alt="" className="loading-logo" />
            <div className="loader-ring">
                <span className="loader-ring__spinner" />
            </div>
            <p className="loading-text">Loading...</p>
        </div>
    );
};

export default Loading;
