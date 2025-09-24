import { useEffect, useState } from "react";
import "./resourceAdmin.css";
import { BASE_URL } from "../../../config";
import LoadingSpinner from "../../loading/loadingComponent";

type BookingType = "Desk" | "VRHeadset" | "MeetingRoom" | "AIServer";

interface Resource {
  resourceId: number;
  resourceName: string;
  resourceType: number; // enum som nummer från backend
  capacity: number;
}

// Lista för <select> och vy-knappar
const resourceTypes: { key: BookingType; label: string }[] = [
  { key: "Desk", label: "Skrivbord" },
  { key: "VRHeadset", label: "VR-Headset" },
  { key: "MeetingRoom", label: "Mötesrum" },
  { key: "AIServer", label: "AI-Server" },
];

// Mappa backend enum-nummer → key (BookingType string)
const enumNumberToKey: Record<number, BookingType> = {
  0: "MeetingRoom",  // exempel: backend enum = 0 för MeetingRoom
  1: "Desk",
  2: "VRHeadset",
  3: "AIServer",
};

// Mappa backend enum-nummer → label
const enumNumberToLabel: Record<number, string> = {
  0: "Mötesrum",
  1: "Skrivbord",
  2: "VR-Headset",
  3: "AI-Server",
};

// Mappa BookingType string → enum-nummer för POST
const enumMap: Record<BookingType, number> = {
  Desk: 1,
  VRHeadset: 2,
  MeetingRoom: 0,
  AIServer: 3,
};



export default function ResourceAdmin() {
  const [selectedType, setSelectedType] = useState<BookingType>("Desk"); // vy
  const [selectedTypeForAdd, setSelectedTypeForAdd] = useState<BookingType>("Desk"); // lägg-till
  const [resources, setResources] = useState<Resource[]>([]);
  const [newResource, setNewResource] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}AdminResource`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data: Resource[] = await res.json();
      setResources(data);
    } catch (error) {
      console.error("Kunde inte ladda resurser:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!newResource.trim() || selectedTypeForAdd === undefined) return;

    const body = {
      resourceId: 0,
      resourceName: newResource,
      resourceType: enumMap[selectedTypeForAdd], // nummer
      capacity: 1,
      timeslots: [],
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}AdminResource`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" 
      },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error adding resource:", errorText);
        alert("Kunde inte lägga till resurs: " + errorText);
        return;
      }

      setNewResource("");
      loadResources();
    } catch (error) {
      console.error("Fetch failed:", error);
      alert("Kunde inte lägga till resurs, nätverksfel?");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Är du säker på att du vill ta bort resursen?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}AdminResource/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("Kunde inte ta bort resurs: " + errorText);
      }
      
      loadResources();
    } catch (error) {
      console.error("Kunde inte ta bort resurs:", error);
      alert("Kunde inte ta bort resurs, nätverksfel?");
    } finally {
      setLoading(false);
    }
  }

  // Filtrera resurser för den valda vy-knappen
  const extractNumber = (name: string): number => {
  const match = name.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

const filteredResources = resources
  .filter((res) => enumNumberToKey[res.resourceType] === selectedType)
  .sort((a, b) => {
    const nameA = a.resourceName.toLowerCase();
    const nameB = b.resourceName.toLowerCase();

    // Extract number from name for sorting
    const numA = extractNumber(nameA);
    const numB = extractNumber(nameB);

    // If both contain numbers, sort numerically
    if (numA && numB) {
      return numA - numB;
    }

    // Else, sort alfabetically
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="resource-admin">
      <h2>Resurshantering</h2>

      {/* Vy-knappar */}
      <div className="type-buttons">
        {resourceTypes.map((type) => (
          <button
            key={type.key}
            className={`type-button ${selectedType === type.key ? "active" : ""}`}
            onClick={() => setSelectedType(type.key)}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Lägg till resurs */}
      <div className="add-resource">
        <input
          type="text"
          placeholder="Namn på resurs"
          value={newResource}
          onChange={(e) => setNewResource(e.target.value)}
        />

        <select
          value={selectedTypeForAdd}
          onChange={(e) => setSelectedTypeForAdd(e.target.value as BookingType)}
        >
          {resourceTypes.map((type) => (
            <option key={type.key} value={type.key}>
              {type.label}
            </option>
          ))}
        </select>

        <button onClick={handleAdd}>➕ Lägg till</button>
      </div>
      {loading && (
        <div className="loadingContainerResources">
          <LoadingSpinner />
        </div>
      )}
      {/* Lista över resurser */}
      <div className="resource-grid">
        {filteredResources.map((res) => (
          <div key={res.resourceId} className="resource-card">
            <h3>{res.resourceName}</h3>
            <p>Typ: {enumNumberToLabel[res.resourceType]}</p>
            <p>Status: (kapacitet: {res.capacity})</p>
            <div className="actions">
              <button className="delete" onClick={() => handleDelete(res.resourceId)}>
                🗑️ Ta bort
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}