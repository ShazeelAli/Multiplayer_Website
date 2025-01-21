import Player from '../utils/player'
import styles from './playerList.module.css'
export default function PlayerList({ playerList }: { playerList: object }) {
    var list: JSX.Element[] = []
    for (const player_name in playerList) {
        list.push(<span key={player_name}>{player_name}:{playerList[player_name].score}</span>)
    }

    return (
        <div className={styles.div}>
            <h4>PLAYER : SCORE</h4>
            {list}
        </div>

    )
}