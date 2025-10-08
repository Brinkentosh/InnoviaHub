using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json;
using InnoviaHub.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using InnoviaHub.DTOs;

namespace Backend.Services
{
    public class OpenAiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public OpenAiService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        public async Task<string> GetChatResponse(string prompt)
        {
            var request = new
            {
                model = "gpt-4",
                messages = new[] {
                    new {role = "user", content = prompt}
                }
            };

            var requestContent = new StringContent(JsonConvert.SerializeObject(request), Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _config["OpenAI:Apikey"]);

            var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", requestContent);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine("❌ OpenAI API error response:");
                Console.WriteLine(responseBody);

                throw new Exception("OpenAI API call failed: " + responseBody);
            }

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            dynamic result = JsonConvert.DeserializeObject(json);

            return result.choices[0].message.content.ToString();
        }

        public string BuildPrompt(string userInput, List<Timeslot> availableTimes)
        {
            var filteredTimes = availableTimes
                .Where(t => t.StartTime.Date >= DateTime.UtcNow.Date.AddDays(1))
                .Take(20);
            var times = string.Join("\n", filteredTimes.Select(t =>
                $"- {t.StartTime:yyyy-MM-dd HH:mm} till {t.EndTime:HH:mm}"));


            return $@"
            Du är en AI-assistent som hjälper användare att boka skrivbord, mötesrum, VR-headset och AI-server.

            Här är en lista på Tillgängliga tider för resurserna:
            {times}

            Användarens meddelande:
            ""{userInput}""

            Instruktioner:
            - Analysera användarens meddelande
            - Identifiera om det matchar någon av de tillgängliga tiderna ovan
            - Om det matchar: föreslå en bokning i naturligt språk
            - Om det inte matchar: föreslå andra tillgängliga alternativ
            - Returnera även en JSON med följande format men skriv inte ut det i medelandet!:


            {{
            ""startTime"": ""YYYY-MM-DDTHH:MM"",
            ""endTime"": ""YYYY-MM-DDTHH:MM"",
            ""date"": ""YYYY-MM-DD"",
            ""resourceType"": ""mötesrum""
            }}
            ";
        }
    }
}
