import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export interface Pokemon {
  name: string;
  url: string;
  image: string;
  backImage: string;
  types: PokemonType[];
}

export interface PokemonType {
  type: {
    name: string;
    url: string;
  };
}

const colorByType: Record<string, string> = {
  grass: "#78C850",
  fire: "#F08030",
  water: "#6890F0",
  bug: "#A8B820",
  normal: "#A8A878",
};

export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  console.log(JSON.stringify(pokemons[0], null, 2));
  async function fetchPokemons() {
    try {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=20",
      );
      const data = await response.json();

      // Detailed Pokemons
      const detailedPokemons = await Promise.all(
        data.results.map(async (p: Pokemon) => {
          const res = await fetch(p.url);
          const details = await res.json();
          return {
            name: p.name,
            url: p.url,
            image: details.sprites.front_default,
            backImage: details.sprites.back_default,
            types: details.types,
          };
        }),
      );

      setPokemons(detailedPokemons);
      // Store data in state as needed
    } catch (error) {
      console.error("Failed to fetch Pokemons:", error);
    }
  }

  useEffect(() => {
    fetchPokemons();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      {pokemons?.map((p: Pokemon) => (
        <Link
          key={p.name}
          href={{
            pathname: "/details",
            params: {
              name: p.name,
            },
          }}
          style={{
            backgroundColor: colorByType[p.types[0].type.name] + 50 || "black",
            padding: 20,
            borderRadius: 20,
          }}
        >
          <View>
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.type}>{p.types[0].type.name}</Text>
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Image
                src={p.image}
                style={{
                  width: 150,
                  height: 150,
                }}
              />
              <Image
                src={p.backImage}
                style={{
                  width: 150,
                  height: 150,
                }}
              />
            </View>
          </View>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  type: {
    fontSize: 20,
    fontWeight: "bold",
    color: "grey",
    textAlign: "center",
  },
});
