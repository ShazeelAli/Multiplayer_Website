import Player from '../utils/player'
export default function PlayerList({ playerList }: { playerList: object }) {
    var list: JSX.Element[] = []
    for (const player_name in playerList) {
        list.push(<li key={player_name}>{player_name}:{playerList[player_name].score}</li>)
    }
    return (
        <div>
            <h4>PLAYERS</h4>
            {list}
        </div>

    )
}