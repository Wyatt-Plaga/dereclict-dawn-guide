[Serializable]
public class GameData {
    public PlayerStats playerStats;
    public Inventory inventory;
    public Progress progress;
    // Add other relevant data here
}

public class GameDataManager : MonoBehaviour {
    public static GameDataManager Instance { get; private set; }
    public GameData CurrentGameData { get; private set; }

    void Awake() {
        if (Instance == null) {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            LoadGameData();
        } else {
            Destroy(gameObject);
        }
    }

    public void SaveGameData() {
        string json = JsonUtility.ToJson(CurrentGameData);
        File.WriteAllText(Application.persistentDataPath + "/save.json", json);
    }

    public void LoadGameData() {
        string path = Application.persistentDataPath + "/save.json";
        if (File.Exists(path)) {
            string json = File.ReadAllText(path);
            CurrentGameData = JsonUtility.FromJson<GameData>(json);
        } else {
            CurrentGameData = new GameData(); // Initialize defaults
        }
    }
} 