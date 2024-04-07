export const formatTime = function (time: number) {
    let seconds = time % 60;
    let minutes = time < 60 ? 0 : Math.floor(time / 60);

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds.toFixed(1)}`;
}