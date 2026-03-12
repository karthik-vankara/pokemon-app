import { Audio } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function Details() {
  const params = useLocalSearchParams();

  const [pokemonDetails, setPokemonDetails] = useState<any>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // derive a stable uri so we don't dereference null later
  const cryUri: string | null = pokemonDetails?.cries?.latest ?? null;

  const playCry = async () => {
    if (!cryUri) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: cryUri },
        { shouldPlay: true },
      );
      setSound(sound);
    } catch (e) {
      console.warn("Error loading sound", e);
    }
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const { name } = params as {
    name: string;
  };

  useEffect(() => {
    if (!name) return;
    console.log("Fetching details for:", name);
    fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
      .then((response) => response.json())
      .then((data) => {
        setPokemonDetails(data);
      })
      .catch((error) => {
        console.error("Error fetching Pokemon details:", error);
      });
  }, [name]);

  // utility functions
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const typeColors: Record<string, string> = {
    grass: "#78C850",
    poison: "#A040A0",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    // add others as needed
  };

  const renderStats = () => {
    if (!pokemonDetails) {
      // defensive: may be called before details arrive
      return null;
    }
    const maxStat = 150; // for bar width
    return pokemonDetails.stats.map((s: any) => (
      <View key={s.stat.name} style={styles.statRow}>
        <Text style={styles.statLabel}>{s.stat.name.toUpperCase()}</Text>
        <View style={styles.statBarBg}>
          <View
            style={[
              styles.statBar,
              { width: `${(s.base_stat / maxStat) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.statValue}>{s.base_stat}</Text>
      </View>
    ));
  };

  const heightInMeters = pokemonDetails
    ? pokemonDetails.height / 10
    : undefined;
  const weightInKg = pokemonDetails ? pokemonDetails.weight / 10 : undefined;

  // if details not ready, render nothing to avoid null dereference errors
  if (!pokemonDetails) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
      {pokemonDetails && (
        <>
          <View style={styles.header}>
            <Text style={styles.name}>
              {capitalize(pokemonDetails.name)} #{pokemonDetails.id}
            </Text>
            <View style={styles.typeContainer}>
              {pokemonDetails.types.map((t: any) => (
                <Text
                  key={t.slot}
                  style={[
                    styles.typeChip,
                    { backgroundColor: typeColors[t.type.name] || "#ccc" },
                  ]}
                >
                  {capitalize(t.type.name)}
                </Text>
              ))}
            </View>
          </View>

          <Image
            source={{
              uri: pokemonDetails.sprites.other["official-artwork"]
                .front_default,
            }}
            style={styles.artwork}
            resizeMode="contain"
          />
          {cryUri && (
            <TouchableOpacity onPress={playCry} style={styles.cryButton}>
              <Text style={styles.cryButtonText}>🔊 Play Cry</Text>
            </TouchableOpacity>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Base XP:</Text>
            <Text style={styles.infoValue}>
              {pokemonDetails.base_experience}
            </Text>
            <Text style={styles.infoLabel}>Height:</Text>
            <Text style={styles.infoValue}>{heightInMeters} m</Text>
            <Text style={styles.infoLabel}>Weight:</Text>
            <Text style={styles.infoValue}>{weightInKg} kg</Text>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Abilities</Text>
            {pokemonDetails.abilities.map((a: any) => (
              <Text key={a.slot} style={styles.listItem}>
                {capitalize(a.ability.name)} {a.is_hidden ? "(Hidden)" : ""}
              </Text>
            ))}
          </View>

          <View>
            <Text style={styles.sectionTitle}>Stats</Text>
            {renderStats()}
          </View>

          <View>
            <Text style={styles.sectionTitle}>Moves</Text>
            {pokemonDetails.moves.slice(0, 10).map((m: any) => (
              <Text key={m.move.name} style={styles.listItem}>
                {capitalize(m.move.name)}
              </Text>
            ))}
          </View>

          <View>
            <Text style={styles.sectionTitle}>Game indices</Text>
            <Text style={styles.listItem}>
              {pokemonDetails.game_indices
                .map((g: any) => capitalize(g.version.name))
                .join(", ")}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
  },
  header: {
    alignItems: "center",
  },
  typeContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  typeChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    color: "#fff",
    fontWeight: "600",
  },
  artwork: {
    width: "100%",
    height: 200,
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  infoLabel: {
    fontWeight: "bold",
    marginRight: 4,
  },
  infoValue: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },
  listItem: {
    fontSize: 16,
    marginLeft: 8,
    marginVertical: 2,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  statLabel: {
    width: 100,
    fontSize: 14,
    fontWeight: "600",
  },
  statBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
    marginHorizontal: 8,
  },
  statBar: {
    height: 8,
    backgroundColor: "#4caf50",
    borderRadius: 4,
  },
  statValue: {
    width: 30,
    textAlign: "right",
  },
  cryButton: {
    alignSelf: "center",
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#2196f3",
    borderRadius: 20,
  },
  cryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
